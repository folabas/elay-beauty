import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const DAY_MAP: Record<string, number> = {
  Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4,
  Friday: 5, Saturday: 6, Sunday: 0,
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

async function ensureAvailability() {
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
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get("date")

    if (!dateStr) {
      return NextResponse.json({ error: "Date parameter required" }, { status: 400 })
    }

    await ensureAvailability()

    const date = new Date(dateStr + "T00:00:00Z")
    const dayOfWeek = date.getUTCDay()

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

    const availability = await prisma.availability.findFirst({
      where: { dayOfWeek, isRecurring: true, isActive: true },
    })

    if (!availability) {
      return NextResponse.json({ slots: [], message: "No availability for this day" })
    }

    const slots: string[] = []
    const [startH, startM] = availability.startTime.split(":").map(Number)
    const [endH, endM] = availability.endTime.split(":").map(Number)

    let hour = startH
    while (hour < endH || (hour === endH && 0 < endM)) {
      slots.push(`${String(hour).padStart(2, "0")}:00`)
      hour++
    }

    const isSunday = dayOfWeek === 0

    const existingBooking = await prisma.booking.findFirst({
      where: {
        date: {
          gte: new Date(dateStr + "T00:00:00Z"),
          lt: new Date(dateStr + "T23:59:59Z"),
        },
        status: { not: "CANCELLED" },
      },
      select: { id: true },
    })

    const dayFull = existingBooking !== null

    const slotList = slots.map((time) => ({
      time,
      available: !dayFull,
    }))

    return NextResponse.json({ slots: slotList, isSunday, dayFull })
  } catch (error) {
    console.error("Failed to fetch slots:", error)
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 })
  }
}
