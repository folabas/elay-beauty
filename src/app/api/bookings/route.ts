import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, bookingConfirmationEmail, adminNotificationEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, serviceName, date, time, hairLength, hairType, notes, isStudent, discountApplied, totalPrice } = body

    if (!name || !email || !serviceName || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const service = await prisma.service.findFirst({
      where: { name: serviceName, isActive: true },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const dateStart = new Date(date + "T00:00:00Z")
    const dateEnd = new Date(date + "T23:59:59Z")

    const existing = await prisma.booking.findFirst({
      where: {
        date: { gte: dateStart, lt: dateEnd },
        time,
        status: { not: "CANCELLED" },
      },
    })

    if (existing) {
      return NextResponse.json({ error: "This time slot is already booked" }, { status: 409 })
    }

    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      user = await prisma.user.create({
        data: { name, email, phone: phone || null },
      })
    }

    const booking = await prisma.booking.create({
      data: {
        clientId: user.id,
        serviceId: service.id,
        date: new Date(date),
        time,
        totalPrice,
        hairLength: hairLength || null,
        hairType: hairType || null,
        notes: notes || null,
        isStudent: isStudent || false,
        discountApplied: discountApplied || null,
      },
    })

    const depositRequired = true

    const clientEmail = await sendEmail({
      to: email,
      ...bookingConfirmationEmail({
        name,
        service: serviceName,
        date,
        time,
        totalPrice,
        depositRequired,
      }),
    })

    const adminEmails = (process.env.ADMIN_NOTIFY_EMAILS || process.env.ADMIN_EMAIL || "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean)

    let adminAllFailed = adminEmails.length > 0
    for (const adminEmail of adminEmails) {
      const result = await sendEmail({
        to: adminEmail,
        ...adminNotificationEmail({
          clientName: name,
          service: serviceName,
          date,
          time,
        }),
      })
      if (result.ok) adminAllFailed = false
    }

    const emailWarnings: string[] = []
    if (!clientEmail.ok) {
      emailWarnings.push(`Confirmation email to you failed: ${clientEmail.error}`)
    }
    if (adminEmails.length > 0 && adminAllFailed) {
      emailWarnings.push("Admin notification email failed")
    }

    return NextResponse.json({
      id: booking.id,
      depositRequired,
      message: "Booking created successfully",
      emailWarnings: emailWarnings.length > 0 ? emailWarnings : undefined,
    })
  } catch (error) {
    console.error("Booking creation failed:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
