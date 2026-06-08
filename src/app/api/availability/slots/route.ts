import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get("date")

    if (!dateStr) {
      return NextResponse.json({ error: "Date parameter required" }, { status: 400 })
    }

    const date = new Date(dateStr + "T00:00:00Z")
    const dayOfWeek = date.getUTCDay()

    // Check if date is blocked
    const blocked = await prisma.blockedSlot.findFirst({
      where: {
        date: {
          gte: new Date(dateStr + "T00:00:00Z"),
          lt: new Date(dateStr + "T23:59:59Z"),
        },
      },
    })

    if (blocked) {
      return NextResponse.json({ slots: [], message: "This date is unavailable" })
    }

    // Get recurring availability for this day of week
    const availability = await prisma.availability.findFirst({
      where: { dayOfWeek, isRecurring: true, isActive: true },
    })

    if (!availability) {
      return NextResponse.json({ slots: [], message: "No availability for this day" })
    }

    // Generate 1-hour slots from start to end
    const slots: string[] = []
    const [startH, startM] = availability.startTime.split(":").map(Number)
    const [endH, endM] = availability.endTime.split(":").map(Number)

    let hour = startH
    while (hour < endH || (hour === endH && 0 < endM)) {
      slots.push(`${String(hour).padStart(2, "0")}:00`)
      hour++
    }

    // Sunday restriction: only cornrows/crotchet (just show slots, handled in UI)
    const isSunday = dayOfWeek === 0

    // Get existing bookings for this date (non-cancelled)
    const existingBookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: new Date(dateStr + "T00:00:00Z"),
          lt: new Date(dateStr + "T23:59:59Z"),
        },
        status: { not: "CANCELLED" },
      },
      select: { time: true },
    })

    const bookedTimes = new Set(existingBookings.map((b) => b.time))

    const slotList = slots.map((time) => ({
      time,
      available: !bookedTimes.has(time),
    }))

    return NextResponse.json({ slots: slotList, isSunday })
  } catch (error) {
    console.error("Failed to fetch slots:", error)
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 })
  }
}
