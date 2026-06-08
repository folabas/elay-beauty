const BREVO_API_KEY = process.env.BREVO_API_KEY
const FROM_EMAIL = "baskids25@gmail.com"
const FROM_NAME = "EL.AY Beauty"

interface SendBookingEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendBookingEmailParams): Promise<{ ok: boolean; error?: string }> {
  if (!BREVO_API_KEY) {
    console.log(`[EMAIL] Would send to ${to}: ${subject}`)
    return { ok: true }
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: FROM_EMAIL, name: FROM_NAME },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Brevo API ${res.status}: ${body}`)
    }

    console.log(`[EMAIL] Sent to ${to}: ${subject}`)
    return { ok: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[EMAIL] Failed to send to ${to}: ${msg}`)
    return { ok: false, error: msg }
  }
}

export function bookingConfirmationEmail(params: {
  name: string
  service: string
  date: string
  time: string
  totalPrice: number
  depositRequired: boolean
}) {
  return {
    subject: "Booking Confirmation – EL.AY Beauty",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="color: #1a1a2e;">Booking Confirmed!</h1>
        <p>Hi ${params.name},</p>
        <p>Your booking has been received.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; color: #6b7280;">Service</td><td style="padding: 8px;">${params.service}</td></tr>
          <tr><td style="padding: 8px; color: #6b7280;">Date</td><td style="padding: 8px;">${params.date}</td></tr>
          <tr><td style="padding: 8px; color: #6b7280;">Time</td><td style="padding: 8px;">${params.time}</td></tr>
          <tr><td style="padding: 8px; color: #6b7280;">Total</td><td style="padding: 8px;">£${params.totalPrice}</td></tr>
        </table>
        ${
          params.depositRequired
            ? `<p style="color: #c9a84c; font-weight: bold;">Please send the £20 deposit to Monzo (Elizabeth Ayedebinu, 04-00-03, 34563358, ref: Hair) to confirm your booking.</p>`
            : `<p style="color: #16a34a; font-weight: bold;">Your deposit has been received. Thank you!</p>`
        }
        <hr style="border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">EL.AY Beauty – London, UK</p>
      </div>
    `,
  }
}

export function cancellationEmail(params: {
  name: string
  bookingId: string
  reason: string
}) {
  return {
    subject: "Booking Cancelled – EL.AY Beauty",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="color: #8b1a2b;">Booking Cancelled</h1>
        <p>Hi ${params.name},</p>
        <p>Your booking #${params.bookingId} has been cancelled.</p>
        <p style="color: #6b7280;">Reason: ${params.reason}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">EL.AY Beauty – London, UK</p>
      </div>
    `,
  }
}

export function rescheduleOfferEmail(params: {
  name: string
  bookingId: string
  reason: string
  alternativeDate: string
  alternativeTime: string
}) {
  return {
    subject: "Booking Cancelled – Alternative Time Offered – EL.AY Beauty",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="color: #c9a84c;">Booking Cancelled – Alternative Offered</h1>
        <p>Hi ${params.name},</p>
        <p>Your booking #${params.bookingId} has been cancelled.</p>
        <p style="color: #6b7280;">Reason: ${params.reason}</p>
        <div style="background: #faf9f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; font-weight: bold; color: #1a1a2e;">Suggested Alternative</p>
          <p style="margin: 8px 0 0; color: #6b7280;">${params.alternativeDate} at ${params.alternativeTime}</p>
          <p style="margin: 8px 0 0; color: #6b7280;">Please call or message to confirm this new time.</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">EL.AY Beauty – London, UK</p>
      </div>
    `,
  }
}

export function adminNotificationEmail(params: {
  clientName: string
  service: string
  date: string
  time: string
}) {
  return {
    subject: `New Booking: ${params.clientName} – ${params.service}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="color: #1a1a2e;">New Booking Received</h1>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; color: #6b7280;">Client</td><td style="padding: 8px;">${params.clientName}</td></tr>
          <tr><td style="padding: 8px; color: #6b7280;">Service</td><td style="padding: 8px;">${params.service}</td></tr>
          <tr><td style="padding: 8px; color: #6b7280;">Date</td><td style="padding: 8px;">${params.date}</td></tr>
          <tr><td style="padding: 8px; color: #6b7280;">Time</td><td style="padding: 8px;">${params.time}</td></tr>
        </table>
      </div>
    `,
  }
}
