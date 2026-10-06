import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { DAY_NAMES, WORKING_DAYS, getWeeklySchedule } from "@/lib/availability"

export async function GET() {
  try {
    const weekly = await getWeeklySchedule()

    const mapped = WORKING_DAYS.map((dow) => weekly.get(dow)!).map((s) => ({
      id: s.id,
      day: DAY_NAMES[s.dayOfWeek!],
      start: s.startTime,
      end: s.endTime,
      timeSlots: s.timeSlots ? JSON.parse(s.timeSlots) : null,
      isActive: s.isActive,
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error("Failed to fetch availability:", error)
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const { id, isActive, startTime, endTime, timeSlots } = body

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const data: Record<string, unknown> = {}
    if (typeof isActive === "boolean") data.isActive = isActive
    if (startTime !== undefined) data.startTime = startTime
    if (endTime !== undefined) data.endTime = endTime
    if (timeSlots !== undefined) data.timeSlots = timeSlots ? JSON.stringify(timeSlots) : null

    await prisma.availability.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update availability:", error)
    return NextResponse.json({ error: "Failed to update availability" }, { status: 500 })
  }
}
