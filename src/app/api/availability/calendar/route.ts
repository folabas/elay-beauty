import { NextResponse } from "next/server"
import { getDateStatuses, isDateString } from "@/lib/availability"

// Public: tells the booking calendar which dates can be picked.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    if (!isDateString(from) || !isDateString(to)) {
      return NextResponse.json({ error: "from and to (YYYY-MM-DD) are required" }, { status: 400 })
    }

    const statuses = await getDateStatuses(from, to)

    return NextResponse.json(
      statuses.map((s) => ({
        date: s.date,
        status: s.isPast || !s.open || s.slots.length === 0 ? "closed" : s.booked ? "booked" : "open",
      }))
    )
  } catch (error) {
    console.error("Failed to fetch calendar:", error)
    return NextResponse.json({ error: "Failed to fetch calendar" }, { status: 500 })
  }
}
