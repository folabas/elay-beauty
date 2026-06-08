import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const DAY_MAP: Record<string, number> = {
  Friday: 5, Saturday: 6, Sunday: 0,
}

const REVERSE_DAY: Record<number, string> = {
  5: "Friday", 6: "Saturday", 0: "Sunday",
}

const DEFAULT_SCHEDULE = [
  { day: "Friday", start: "17:00", end: "24:00" },
  { day: "Saturday", start: "07:00", end: "12:00" },
  { day: "Sunday", start: "15:00", end: "17:00" },
]

export async function GET() {
  try {
    let schedule = await prisma.availability.findMany({
      where: { isRecurring: true },
      orderBy: { dayOfWeek: "asc" },
    })

    if (schedule.length === 0) {
      for (const s of DEFAULT_SCHEDULE) {
        await prisma.availability.create({
          data: {
            dayOfWeek: DAY_MAP[s.day],
            startTime: s.start,
            endTime: s.end,
            isRecurring: true,
            isActive: true,
          },
        })
      }
      schedule = await prisma.availability.findMany({
        where: { isRecurring: true },
        orderBy: { dayOfWeek: "asc" },
      })
    }

    const mapped = schedule.map((s) => ({
      id: s.id,
      day: REVERSE_DAY[s.dayOfWeek ?? 5] ?? "Unknown",
      start: s.startTime,
      end: s.endTime,
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
    const { id, isActive } = body

    if (!id || typeof isActive !== "boolean") {
      return NextResponse.json({ error: "Missing id or isActive" }, { status: 400 })
    }

    await prisma.availability.update({
      where: { id },
      data: { isActive },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update availability:", error)
    return NextResponse.json({ error: "Failed to update availability" }, { status: 500 })
  }
}
