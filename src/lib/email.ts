const BREVO_API_KEY = process.env.BREVO_API_KEY
const FROM_EMAIL = "baskids25@gmail.com"
const FROM_NAME = "EL.AY Beauty"

const BASE_STYLE = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
    body { margin: 0; padding: 0; background: #f5f3ef; }
    .wrapper { background: #f5f3ef; padding: 32px 16px; }
    .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .header { background: #1a1a2e; padding: 32px 40px 24px; text-align: center; }
    .header h1 { font-family: 'Playfair Display', Georgia, serif; color: #c9a84c; font-size: 24px; margin: 0; font-weight: 700; letter-spacing: -0.5px; }
    .header .sub { color: #a0a0b0; font-family: 'Inter', Arial, sans-serif; font-size: 13px; margin: 6px 0 0; }
    .body { padding: 32px 40px; }
    .body h2 { font-family: 'Playfair Display', Georgia, serif; color: #1a1a2e; font-size: 20px; margin: 0 0 4px; font-weight: 600; }
    .body p { font-family: 'Inter', Arial, sans-serif; color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 16px; }
    .details { background: #faf9f6; border-radius: 8px; padding: 20px; margin: 0 0 20px; }
    .details table { width: 100%; border-collapse: collapse; }
    .details td { padding: 8px 0; font-family: 'Inter', Arial, sans-serif; font-size: 14px; border-bottom: 1px solid #e5e7eb; }
    .details tr:last-child td { border-bottom: none; }
    .details .label { color: #9ca3af; }
    .details .value { color: #1a1a2e; font-weight: 500; text-align: right; }
    .details .value.gold { color: #c9a84c; font-weight: 600; }
    .details .value.green { color: #16a34a; font-weight: 600; }
    .deposit-box { background: #fdf8ee; border: 1px solid #c9a84c; border-radius: 8px; padding: 16px 20px; margin: 0 0 20px; }
    .deposit-box p { font-family: 'Inter', Arial, sans-serif; font-size: 13px; color: #1a1a2e; margin: 0 0 8px; }
    .deposit-box .accent { color: #c9a84c; font-weight: 600; }
    .deposit-box .bank-row { display: flex; justify-content: space-between; font-family: 'Inter', Arial, sans-serif; font-size: 13px; padding: 4px 0; color: #4b5563; }
    .deposit-box .bank-row strong { color: #1a1a2e; }
    .deposit-box .mono { font-family: 'Courier New', monospace; }
    .footer { text-align: center; padding: 0 40px 32px; }
    .footer p { font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #9ca3af; margin: 0 0 4px; }
    .footer a { color: #c9a84c; text-decoration: none; }
    .footer .divider { border: none; border-top: 1px solid #e5e7eb; margin: 0 0 16px; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 100px; font-family: 'Inter', Arial, sans-serif; font-size: 12px; font-weight: 600; }
    .badge.gold { background: #c9a84c; color: #1a1a2e; }
    .badge.green { background: #dcfce7; color: #16a34a; }
    .badge.red { background: #fce4e4; color: #8b1a2b; }
  </style>
`

function wrapHtml(title: string, content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width">${BASE_STYLE}</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>EL.AY_Beauty</h1>
        <p class="sub">Professional Hair Braiding &amp; Styling</p>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <hr class="divider" />
        <p>EL.AY Beauty &ndash; London, UK</p>
        <p><a href="https://elay-beauty.vercel.app/contact">Contact us</a> &middot; <a href="https://wa.link/wycx8l">WhatsApp</a></p>
      </div>
    </div>
  </div>
</body>
</html>`
}

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
  const content = `
    <h2>Booking Confirmed</h2>
    <p>Hi ${params.name},</p>
    <p>Your appointment has been booked successfully. Here are the details:</p>

    <div class="details">
      <table>
        <tr><td class="label">Service</td><td class="value">${params.service}</td></tr>
        <tr><td class="label">Date</td><td class="value">${params.date}</td></tr>
        <tr><td class="label">Time</td><td class="value">${params.time}</td></tr>
        <tr><td class="label">Total</td><td class="value gold">£${params.totalPrice}</td></tr>
      </table>
    </div>

    ${
      params.depositRequired
        ? `
    <div class="deposit-box">
      <p><span class="accent">&#9733; £20 Deposit Required</span></p>
      <p>Send your deposit to secure this booking:</p>
      <div class="bank-row"><span>Bank</span><strong>Monzo</strong></div>
      <div class="bank-row"><span>Name</span><strong>Elizabeth Ayedebinu</strong></div>
      <div class="bank-row"><span>Sort Code</span><strong class="mono">04-00-03</strong></div>
      <div class="bank-row"><span>Account</span><strong class="mono">34563358</strong></div>
      <div class="bank-row"><span>Reference</span><strong class="mono">Hair</strong></div>
      <p style="margin:12px 0 0;font-size:12px;color:#9ca3af;">Your booking will be confirmed once we receive the deposit.</p>
    </div>`
        : `
    <div style="background:#f0fdf4;border:1px solid #16a34a;border-radius:8px;padding:16px 20px;margin:0 0 20px;">
      <p style="margin:0;color:#16a34a;font-weight:600;font-family:'Inter',Arial,sans-serif;font-size:14px;">&#10003; Deposit received &mdash; thank you!</p>
    </div>`
    }

    <p style="font-size:13px;color:#9ca3af;margin:0;">Need to make changes? <a href="https://wa.link/wycx8l" style="color:#c9a84c;">Message us on WhatsApp</a></p>
  `

  return { subject: "Booking Confirmation – EL.AY Beauty", html: wrapHtml("Booking Confirmation", content) }
}

export function cancellationEmail(params: {
  name: string
  bookingId: string
  reason: string
}) {
  const content = `
    <h2 style="color:#8b1a2b;">Booking Cancelled</h2>
    <p>Hi ${params.name},</p>
    <p>Your booking <strong>#${params.bookingId}</strong> has been cancelled.</p>

    <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:16px 20px;margin:0 0 20px;">
      <p style="margin:0;font-family:'Inter',Arial,sans-serif;font-size:13px;color:#8b1a2b;">
        <strong>Reason:</strong> ${params.reason}
      </p>
    </div>

    <p style="font-size:13px;color:#9ca3af;">If you'd like to rebook, visit our website or message us on WhatsApp.</p>
    <p style="margin:0;"><a href="https://wa.link/wycx8l" style="color:#c9a84c;font-family:'Inter',Arial,sans-serif;font-size:14px;">Chat on WhatsApp</a></p>
  `

  return { subject: "Booking Cancelled – EL.AY Beauty", html: wrapHtml("Booking Cancelled", content) }
}

export function rescheduleOfferEmail(params: {
  name: string
  bookingId: string
  reason: string
  alternativeDate: string
  alternativeTime: string
}) {
  const content = `
    <h2 style="color:#c9a84c;">Alternative Time Offered</h2>
    <p>Hi ${params.name},</p>
    <p>Your booking <strong>#${params.bookingId}</strong> has been cancelled, but we'd like to offer you an alternative time:</p>

    <div style="background:#fdf8ee;border:1px solid #c9a84c;border-radius:8px;padding:20px;margin:0 0 20px;">
      <p style="margin:0 0 4px;font-weight:600;font-family:'Inter',Arial,sans-serif;font-size:14px;color:#1a1a2e;">Suggested Alternative</p>
      <p style="margin:0 0 12px;font-family:'Inter',Arial,sans-serif;font-size:18px;color:#c9a84c;font-weight:600;">${params.alternativeDate}<br/>at ${params.alternativeTime}</p>
      <p style="margin:0;font-family:'Inter',Arial,sans-serif;font-size:13px;color:#6b7280;">Please reply on WhatsApp to confirm or discuss this time.</p>
    </div>

    <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:12px 16px;margin:0 0 20px;">
      <p style="margin:0;font-family:'Inter',Arial,sans-serif;font-size:13px;color:#8b1a2b;">
        <strong>Cancellation reason:</strong> ${params.reason}
      </p>
    </div>

    <p style="margin:0;"><a href="https://wa.link/wycx8l" style="display:inline-block;background:#c9a84c;color:#1a1a2e;text-decoration:none;padding:10px 24px;border-radius:8px;font-family:'Inter',Arial,sans-serif;font-size:14px;font-weight:600;">Reply on WhatsApp</a></p>
  `

  return { subject: "Alternative Time Offered – EL.AY Beauty", html: wrapHtml("Alternative Time Offered", content) }
}

export function adminNotificationEmail(params: {
  clientName: string
  service: string
  date: string
  time: string
}) {
  const content = `
    <div style="text-align:center;margin-bottom:16px;">
      <span class="badge gold">NEW BOOKING</span>
    </div>
    <h2 style="text-align:center;">New Booking Received</h2>
    <p style="text-align:center;color:#9ca3af;">A client has booked an appointment</p>

    <div class="details">
      <table>
        <tr><td class="label">Client</td><td class="value">${params.clientName}</td></tr>
        <tr><td class="label">Service</td><td class="value">${params.service}</td></tr>
        <tr><td class="label">Date</td><td class="value">${params.date}</td></tr>
        <tr><td class="label">Time</td><td class="value">${params.time}</td></tr>
      </table>
    </div>

    <p style="text-align:center;margin:0;"><a href="https://elay-beauty.vercel.app/admin" style="display:inline-block;background:#1a1a2e;color:#ffffff;text-decoration:none;padding:10px 24px;border-radius:8px;font-family:'Inter',Arial,sans-serif;font-size:14px;font-weight:600;">View in Admin Dashboard</a></p>
  `

  return { subject: `New Booking: ${params.clientName} – ${params.service}`, html: wrapHtml("New Booking", content) }
}
