import { prisma } from "@/lib/prisma"

// The business only works weekends. Any other weekday is always closed.
export const WORKING_DAYS = [6, 0] // Saturday, Sunday

export const DAY_NAMES: Record<number, string> = {
  0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday",
  4: "Thursday", 5: "Friday", 6: "Saturday",
}

const DEFAULT_SCHEDULE: Record<number, { start: string; end: string }> = {
  6: { start: "07:00", end: "09:00" },
  0: { start: "15:00", end: "17:00" },
}

const MAX_RANGE_DAYS = 400

export interface DateStatus {
  date: string
  dayOfWeek: number
  isWorkingDay: boolean
  isPast: boolean
  open: boolean
  start: string | null
  end: string | null
  timeSlots: string[] | null
  slots: string[]
  source: "weekly" | "override" | "blocked" | "none"
  overrideId: string | null
  blockedReason: string | null
  booked: boolean
}

export function isDateString(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(toUTCDate(value).getTime())
}

export function toUTCDate(date: string) {
  return new Date(date + "T00:00:00Z")
}

export function toDateString(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function addDays(date: string, days: number) {
  const d = toUTCDate(date)
  d.setUTCDate(d.getUTCDate() + days)
  return toDateString(d)
}

// "Today" in the salon's local time, so the calendar flips at UK midnight.
export function todayString() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date())
}

export function generateSlotsFromRange(startTime: string, endTime: string): string[] {
  const slots: string[] = []
  const [startH] = startTime.split(":").map(Number)
  const [endH, endM] = endTime.split(":").map(Number)

  let hour = startH
  while (hour < endH || (hour === endH && 0 < endM)) {
    slots.push(`${String(hour).padStart(2, "0")}:00`)
    hour++
  }
  return slots
}

function parseSlots(timeSlots: string | null): string[] | null {
  if (!timeSlots) return null
  try {
    const parsed = JSON.parse(timeSlots)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
  } catch {
    return null
  }
}

/** Creates the Saturday/Sunday weekly rows if they don't exist yet. */
export async function ensureWeeklySchedule() {
  const existing = await prisma.availability.findMany({
    where: { isRecurring: true, dayOfWeek: { in: WORKING_DAYS } },
    select: { dayOfWeek: true },
  })
  const have = new Set(existing.map((d) => d.dayOfWeek))

  for (const dow of WORKING_DAYS) {
    if (!have.has(dow)) {
      await prisma.availability.create({
        data: {
          dayOfWeek: dow,
          startTime: DEFAULT_SCHEDULE[dow].start,
          endTime: DEFAULT_SCHEDULE[dow].end,
          isRecurring: true,
          isActive: true,
        },
      })
    }
  }
}

export async function getWeeklySchedule() {
  await ensureWeeklySchedule()
  const rows = await prisma.availability.findMany({
    where: { isRecurring: true, dayOfWeek: { in: WORKING_DAYS } },
    orderBy: { createdAt: "asc" },
  })
  // If duplicates ever got created, the oldest row wins.
  const byDay = new Map<number, (typeof rows)[number]>()
  for (const row of rows) {
    if (row.dayOfWeek !== null && !byDay.has(row.dayOfWeek)) byDay.set(row.dayOfWeek, row)
  }
  return byDay
}

/**
 * Works out whether each date in [from, to] is open for bookings.
 * Priority: blocked date range > date-specific override > weekly schedule.
 */
export async function getDateStatuses(from: string, to: string): Promise<DateStatus[]> {
  if (to < from) return []
  if ((toUTCDate(to).getTime() - toUTCDate(from).getTime()) / 86400000 > MAX_RANGE_DAYS) {
    to = addDays(from, MAX_RANGE_DAYS)
  }

  const fromStart = toUTCDate(from)
  const toEnd = new Date(to + "T23:59:59.999Z")

  const [weekly, overrides, blocked, bookings] = await Promise.all([
    getWeeklySchedule(),
    prisma.availability.findMany({
      where: { isRecurring: false, specificDate: { gte: fromStart, lte: toEnd } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.blockedSlot.findMany({
      where: {
        date: { lte: toEnd },
        OR: [{ endDate: { gte: fromStart } }, { endDate: null, date: { gte: fromStart } }],
      },
    }),
    prisma.booking.findMany({
      where: { date: { gte: fromStart, lte: toEnd }, status: { not: "CANCELLED" } },
      select: { date: true },
    }),
  ])

  const overrideByDate = new Map<string, (typeof overrides)[number]>()
  for (const o of overrides) {
    const key = toDateString(o.specificDate!)
    if (!overrideByDate.has(key)) overrideByDate.set(key, o)
  }
  const bookedDates = new Set(bookings.map((b) => toDateString(b.date)))
  const today = todayString()

  const result: DateStatus[] = []
  for (let date = from; date <= to; date = addDays(date, 1)) {
    const dayOfWeek = toUTCDate(date).getUTCDay()
    const isWorkingDay = WORKING_DAYS.includes(dayOfWeek)
    const block = blocked.find((b) => {
      const start = toDateString(b.date)
      const end = b.endDate ? toDateString(b.endDate) : start
      return date >= start && date <= end
    })
    const override = overrideByDate.get(date)
    const week = weekly.get(dayOfWeek)

    const status: DateStatus = {
      date,
      dayOfWeek,
      isWorkingDay,
      isPast: date < today,
      open: false,
      start: null,
      end: null,
      timeSlots: null,
      slots: [],
      source: "none",
      overrideId: override?.id ?? null,
      blockedReason: null,
      booked: bookedDates.has(date),
    }

    if (isWorkingDay) {
      const rule = override ?? week
      if (rule) {
        status.source = override ? "override" : "weekly"
        status.open = rule.isActive
        status.start = rule.startTime
        status.end = rule.endTime
        status.timeSlots = parseSlots(rule.timeSlots)
      }
      if (block) {
        status.source = "blocked"
        status.open = false
        status.blockedReason = block.reason ?? "Blocked"
      }
    }

    if (status.start && status.end) {
      status.slots = status.timeSlots ?? generateSlotsFromRange(status.start, status.end)
    }

    result.push(status)
  }

  return result
}

export async function getDateStatus(date: string) {
  const [status] = await getDateStatuses(date, date)
  return status
}
