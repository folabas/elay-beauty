import { NextResponse } from "next/server"
import { getDateStatus, isDateString } from "@/lib/availability"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get("date")

    if (!isDateString(dateStr)) {
      return NextResponse.json({ error: "Date parameter required" }, { status: 400 })
    }

    const status = await getDateStatus(dateStr)
    const isSunday = status.dayOfWeek === 0

    if (status.isPast || !status.open || status.slots.length === 0) {
      return NextResponse.json({
        slots: [],
        fullyBlocked: status.source === "blocked",
        dayFull: false,
        isSunday,
        message: "No availability for this day",
      })
    }

    // Only one appointment is taken per day.
    if (status.booked) {
      return NextResponse.json({ slots: [], fullyBlocked: false, dayFull: true, isSunday })
    }

    return NextResponse.json({
      slots: status.slots.map((time) => ({ time, available: true })),
      fullyBlocked: false,
      dayFull: false,
      isSunday,
    })
  } catch (error) {
    console.error("Failed to fetch slots:", error)
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 })
  }
}
