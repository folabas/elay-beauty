import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, bookingConfirmationEmail, cancellationEmail, rescheduleOfferEmail } from "@/lib/email"
import { createBookingEvent, deleteBookingEvent } from "@/lib/google-calendar"

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
      const updated = await prisma.booking.update({
        where: { id },
        data: { depositPaid: true, status: "CONFIRMED" },
        include: { client: true, service: true },
      })

      const dateStr = booking.date.toISOString().split("T")[0]
      const emailResult = await sendEmail({
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

      let calendarWarning: string | undefined
      try {
        const event = await createBookingEvent(updated)
        if (event.id) {
          await prisma.booking.update({
            where: { id },
            data: { googleEventId: event.id },
          })
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error"
        calendarWarning = `Calendar event failed: ${msg}`
        console.error("[CALENDAR] Failed to create event:", err)
      }

      return NextResponse.json({
        message: "Deposit confirmed",
        emailWarning: emailResult.ok ? undefined : `Email failed: ${emailResult.error}`,
        calendarWarning,
      })
    }

    if (action === "cancel") {
      if (!reason) {
        return NextResponse.json({ error: "Cancellation reason required" }, { status: 400 })
      }

      await prisma.booking.update({
        where: { id },
        data: { status: "CANCELLED", cancellationReason: reason },
      })

      if (booking.googleEventId) {
        deleteBookingEvent(booking.googleEventId).catch((err) =>
          console.error("[CALENDAR] Failed to delete event:", err)
        )
      }

      const shortId = booking.id.slice(0, 8)
      let emailResult: { ok: boolean; error?: string }

      if (alternative?.date && alternative?.time) {
        emailResult = await sendEmail({
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
        emailResult = await sendEmail({
          to: booking.client.email,
          ...cancellationEmail({
            name: booking.client.name,
            bookingId: shortId,
            reason,
          }),
        })
      }

      return NextResponse.json({
        message: "Booking cancelled",
        emailWarning: emailResult.ok ? undefined : `Email failed: ${emailResult.error}`,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Booking update failed:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}
