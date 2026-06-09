import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const DAY_MAP: Record<string, number> = {
  Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4,
  Friday: 5, Saturday: 6, Sunday: 0,
}

const REVERSE_DAY: Record<number, string> = {
  1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday",
  5: "Friday", 6: "Saturday", 0: "Sunday",
}

const DEFAULT_SCHEDULE = [
  { day: "Monday", start: "09:00", end: "17:00", isActive: false },
  { day: "Tuesday", start: "09:00", end: "17:00", isActive: false },
  { day: "Wednesday", start: "09:00", end: "17:00", isActive: false },
  { day: "Thursday", start: "09:00", end: "17:00", isActive: false },
  { day: "Friday", start: "17:00", end: "24:00", isActive: true },
  { day: "Saturday", start: "07:00", end: "12:00", isActive: true },
  { day: "Sunday", start: "15:00", end: "17:00", isActive: true },
]

export async function GET() {
  try {
    const existingDays = await prisma.availability.findMany({
      where: { isRecurring: true },
      select: { dayOfWeek: true },
    })
    const existingDaySet = new Set(existingDays.map((d) => d.dayOfWeek))

    for (const s of DEFAULT_SCHEDULE) {
      const dow = DAY_MAP[s.day]
      if (!existingDaySet.has(dow)) {
        await prisma.availability.create({
          data: {
            dayOfWeek: dow,
            startTime: s.start,
            endTime: s.end,
            isRecurring: true,
            isActive: s.isActive,
          },
        })
      }
    }

    const schedule = await prisma.availability.findMany({
      where: { isRecurring: true },
      orderBy: { dayOfWeek: "asc" },
    })

    const mapped = schedule.map((s) => ({
      id: s.id,
      day: REVERSE_DAY[s.dayOfWeek ?? 5] ?? "Unknown",
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
