import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendBookingEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendBookingEmailParams) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_xxxxxxxxxxxx") {
    console.log(`[EMAIL] Would send to ${to}: ${subject}`)
    return
  }

  try {
    await resend.emails.send({
      from: "EL.AY Beauty <bookings@elaybeauty.com>",
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error("Failed to send email:", error)
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
            : ""
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
