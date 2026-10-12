import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import {
  DAY_NAMES,
  WORKING_DAYS,
  isDateString,
  loadWeekly,
  toDateString,
  toUTCDate,
  todayString,
} from "@/lib/availability"

export async function GET() {
  try {
    const { base, scheduled } = await loadWeekly()

    const mapped = WORKING_DAYS.map((dow) => base.get(dow)!).map((s) => ({
      id: s.id,
      day: DAY_NAMES[s.dayOfWeek!],
      start: s.startTime,
      end: s.endTime,
      timeSlots: s.timeSlots ? JSON.parse(s.timeSlots) : null,
      isActive: s.isActive,
      scheduled: scheduled
        .filter((c) => c.dayOfWeek === s.dayOfWeek)
        .map((c) => ({ id: c.id, from: toDateString(c.specificDate!), isActive: c.isActive })),
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error("Failed to fetch availability:", error)
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 })
  }
}

/**
 * Updates a weekday's weekly rule. With `effectiveFrom` (a future YYYY-MM-DD) the
 * open/closed change is scheduled to start on that date instead of applying now.
 */
export async function PUT(request: Request) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const { id, isActive, startTime, endTime, timeSlots, effectiveFrom } = body

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    if (effectiveFrom !== undefined && effectiveFrom !== null) {
      if (!isDateString(effectiveFrom) || typeof isActive !== "boolean") {
        return NextResponse.json({ error: "effectiveFrom needs a YYYY-MM-DD date and isActive" }, { status: 400 })
      }

      if (effectiveFrom > todayString()) {
        const weekly = await prisma.availability.findFirst({
          where: { id, isRecurring: true, specificDate: null },
        })
        if (!weekly) {
          return NextResponse.json({ error: "Weekly schedule not found" }, { status: 404 })
        }

        const specificDate = toUTCDate(effectiveFrom)
        await prisma.$transaction([
          // One scheduled change per weekday per start date.
          prisma.availability.deleteMany({
            where: { isRecurring: true, dayOfWeek: weekly.dayOfWeek, specificDate },
          }),
          prisma.availability.create({
            data: {
              dayOfWeek: weekly.dayOfWeek,
              specificDate,
              isRecurring: true,
              isActive,
              startTime: weekly.startTime,
              endTime: weekly.endTime,
              timeSlots: weekly.timeSlots,
            },
          }),
        ])

        return NextResponse.json({ success: true, scheduled: true })
      }
      // A start date of today (or earlier) just applies now.
    }

    const data: Record<string, unknown> = {}
    if (typeof isActive === "boolean") data.isActive = isActive
    if (startTime !== undefined) data.startTime = startTime
    if (endTime !== undefined) data.endTime = endTime
    if (timeSlots !== undefined) data.timeSlots = timeSlots ? JSON.stringify(timeSlots) : null

    const updated = await prisma.availability.update({
      where: { id },
      data,
    })

    // Keep the hours of any scheduled changes for this weekday in step with the new hours.
    const times = { ...data }
    delete times.isActive
    if (Object.keys(times).length > 0) {
      await prisma.availability.updateMany({
        where: { isRecurring: true, dayOfWeek: updated.dayOfWeek, specificDate: { not: null } },
        data: times,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update availability:", error)
    return NextResponse.json({ error: "Failed to update availability" }, { status: 500 })
  }
}

// Cancels a scheduled weekly change. Body: { id }
export async function DELETE(request: Request) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    await prisma.availability.deleteMany({
      where: { id, isRecurring: true, specificDate: { not: null } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to cancel scheduled change:", error)
    return NextResponse.json({ error: "Failed to cancel scheduled change" }, { status: 500 })
  }
}
