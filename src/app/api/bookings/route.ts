import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, bookingConfirmationEmail, adminNotificationEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, serviceName, date, time, hairLength, hairType, notes, isStudent, totalPrice } = body

    if (!name || !email || !serviceName || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const service = await prisma.service.findFirst({
      where: { name: serviceName, isActive: true },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
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
      },
    })

    const depositRequired = totalPrice > 30

    await sendEmail({
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

    if (process.env.ADMIN_EMAIL) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        ...adminNotificationEmail({
          clientName: name,
          service: serviceName,
          date,
          time,
        }),
      })
    }

    return NextResponse.json({
      id: booking.id,
      depositRequired,
      message: "Booking created successfully",
    })
  } catch (error) {
    console.error("Booking creation failed:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
