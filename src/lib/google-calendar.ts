import { google } from "googleapis"
import { prisma } from "@/lib/prisma"

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
]
const TIMEZONE = "Europe/London"

function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  const missing = [
    !clientId && "GOOGLE_CLIENT_ID",
    !clientSecret && "GOOGLE_CLIENT_SECRET",
    !redirectUri && "GOOGLE_REDIRECT_URI",
  ].filter(Boolean)

  if (missing.length > 0) {
    throw new Error(`Google Calendar not configured: missing ${missing.join(", ")}. Set these in your environment variables.`)
  }

  // forceRefreshOnFailure: if Google rejects the access token, get a new one and retry.
  return new google.auth.OAuth2({ clientId, clientSecret, redirectUri, forceRefreshOnFailure: true })
}

export function getAuthUrl(): string {
  const oauth2Client = getOAuthClient()
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  })
}

export async function saveTokensFromCode(code: string): Promise<void> {
  const oauth2Client = getOAuthClient()
  const { tokens } = await oauth2Client.getToken(code)

  if (!tokens.refresh_token) {
    throw new Error("No refresh token received. Make sure to authorize with prompt=consent.")
  }

  oauth2Client.setCredentials(tokens)

  let email: string | null = null
  try {
    const { data } = await google.people("v1").people.get({
      auth: oauth2Client,
      resourceName: "people/me",
      personFields: "emailAddresses",
    })
    email = data.emailAddresses?.[0]?.value ?? null
  } catch {
    try {
      const tokenInfo = await oauth2Client.getTokenInfo(tokens.access_token!)
      email = tokenInfo.email ?? null
    } catch {
      // email not available
    }
  }

  const existing = await prisma.calendarToken.findFirst()
  const data = {
    accessToken: tokens.access_token!,
    refreshToken: tokens.refresh_token,
    // expiry_date is already an absolute timestamp, not a duration.
    expiryDate: new Date(tokens.expiry_date ?? Date.now() + 3600 * 1000),
    email,
  }

  if (existing) {
    await prisma.calendarToken.update({ where: { id: existing.id }, data })
  } else {
    await prisma.calendarToken.create({ data })
  }
}

export async function disconnectCalendar(): Promise<void> {
  await prisma.calendarToken.deleteMany()
}

export async function isCalendarConnected(): Promise<boolean> {
  const token = await prisma.calendarToken.findFirst()
  return !!token
}

async function getCalendarClient() {
  const stored = await prisma.calendarToken.findFirst()
  if (!stored) throw new Error("Google Calendar not connected")

  const oauth2Client = getOAuthClient()
  // Access tokens last about an hour. Older connections were saved with an expiry far in
  // the future, so an implausible expiry means "unknown": drop the access token and let
  // the refresh token fetch a new one.
  const expiry = stored.expiryDate.getTime()
  const expiryIsPlausible = expiry < Date.now() + 2 * 60 * 60 * 1000
  oauth2Client.setCredentials(
    expiryIsPlausible
      ? { access_token: stored.accessToken, refresh_token: stored.refreshToken, expiry_date: expiry }
      : { refresh_token: stored.refreshToken }
  )

  oauth2Client.on("tokens", async (tokens) => {
    const update: Record<string, unknown> = {}
    if (tokens.access_token) update.accessToken = tokens.access_token
    if (tokens.expiry_date) update.expiryDate = new Date(tokens.expiry_date)
    if (tokens.refresh_token) update.refreshToken = tokens.refresh_token
    if (Object.keys(update).length > 0) {
      await prisma.calendarToken.update({ where: { id: stored.id }, data: update as any })
    }
  })

  return google.calendar({ version: "v3", auth: oauth2Client })
}

interface BookingForCalendar {
  id: string
  date: Date
  time: string
  client: { name: string; phone: string | null }
  service: { name: string; duration: number | null }
  totalPrice: number
  notes: string | null
}

interface EventOptions {
  /** True while the deposit hasn't been paid yet. */
  pending?: boolean
}

function buildEvent(booking: BookingForCalendar, { pending = false }: EventOptions = {}) {
  const dateStr = booking.date.toISOString().split("T")[0]
  const [hours, minutes] = booking.time.split(":").map(Number)

  const durationMinutes = booking.service.duration ?? 60
  const startTotal = hours * 60 + minutes
  const endTotal = startTotal + durationMinutes
  const endHours = Math.floor(endTotal / 60)
  const endMinutes = endTotal % 60

  const pad = (n: number) => String(n).padStart(2, "0")

  return {
    summary: `EL.AY Beauty – ${booking.service.name} – ${booking.client.name}${pending ? " (deposit pending)" : ""}`,
    description: [
      pending ? "Status: awaiting deposit" : "Status: deposit paid",
      `Client: ${booking.client.name}`,
      booking.client.phone ? `Phone: ${booking.client.phone}` : null,
      `Service: ${booking.service.name}`,
      `Total: £${booking.totalPrice}`,
      booking.notes ? `Notes: ${booking.notes}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    start: {
      dateTime: `${dateStr}T${pad(hours)}:${pad(minutes)}:00`,
      timeZone: TIMEZONE,
    },
    end: {
      dateTime: `${dateStr}T${pad(endHours)}:${pad(endMinutes)}:00`,
      timeZone: TIMEZONE,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 30 },
        { method: "email", minutes: 30 },
      ],
    },
  }
}

export async function createBookingEvent(booking: BookingForCalendar, options?: EventOptions) {
  const calendar = await getCalendarClient()
  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary"
  const response = await calendar.events.insert({ calendarId, requestBody: buildEvent(booking, options) })
  return response.data
}

export async function updateBookingEvent(eventId: string, booking: BookingForCalendar, options?: EventOptions) {
  const calendar = await getCalendarClient()
  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary"
  const response = await calendar.events.update({ calendarId, eventId, requestBody: buildEvent(booking, options) })
  return response.data
}

export async function deleteBookingEvent(eventId: string) {
  try {
    const calendar = await getCalendarClient()
    const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary"
    await calendar.events.delete({ calendarId, eventId })
  } catch (error: any) {
    // Already gone from the calendar.
    if (error?.code === 410 || error?.code === 404) return
    throw error
  }
}
