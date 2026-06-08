import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, bookingConfirmationEmail, cancellationEmail, rescheduleOfferEmail } from "@/lib/email"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, reason, alternative } = body

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { client: true, service: true },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (action === "mark-paid") {
      await prisma.booking.update({
        where: { id },
        data: { depositPaid: true, status: "CONFIRMED" },
      })

      const dateStr = booking.date.toISOString().split("T")[0]
      await sendEmail({
        to: booking.client.email,
        ...bookingConfirmationEmail({
          name: booking.client.name,
          service: booking.service.name,
          date: dateStr,
          time: booking.time,
          totalPrice: booking.totalPrice,
          depositRequired: false,
        }),
      })

      return NextResponse.json({ message: "Deposit confirmed" })
    }

    if (action === "cancel") {
      if (!reason) {
        return NextResponse.json({ error: "Cancellation reason required" }, { status: 400 })
      }

      await prisma.booking.update({
        where: { id },
        data: { status: "CANCELLED", cancellationReason: reason },
      })

      const shortId = booking.id.slice(0, 8)

      if (alternative?.date && alternative?.time) {
        await sendEmail({
          to: booking.client.email,
          ...rescheduleOfferEmail({
            name: booking.client.name,
            bookingId: shortId,
            reason,
            alternativeDate: alternative.date,
            alternativeTime: alternative.time,
          }),
        })
      } else {
        await sendEmail({
          to: booking.client.email,
          ...cancellationEmail({
            name: booking.client.name,
            bookingId: shortId,
            reason,
          }),
        })
      }

      return NextResponse.json({ message: "Booking cancelled" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Booking update failed:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}
