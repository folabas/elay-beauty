import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import {
  WORKING_DAYS,
  getDateStatuses,
  getWeeklySchedule,
  isDateString,
  toUTCDate,
} from "@/lib/availability"

const MAX_DATES = 400

// Admin: full status of every weekend date in a range, including overrides and blocks.
export async function GET(request: Request) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    if (!isDateString(from) || !isDateString(to)) {
      return NextResponse.json({ error: "from and to (YYYY-MM-DD) are required" }, { status: 400 })
    }

    const statuses = await getDateStatuses(from, to)
    return NextResponse.json(statuses.filter((s) => s.isWorkingDay))
  } catch (error) {
    console.error("Failed to fetch date availability:", error)
    return NextResponse.json({ error: "Failed to fetch date availability" }, { status: 500 })
  }
}

function parseDates(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_DATES) return null
  if (!value.every(isDateString)) return null
  return [...new Set(value as string[])].filter((d) => WORKING_DAYS.includes(toUTCDate(d).getUTCDay()))
}

/**
 * Admin: open/close or retime specific dates without touching the weekly schedule.
 * Body: { dates: string[], isActive?: boolean, startTime?: string, endTime?: string, timeSlots?: string[] | null }
 */
export async function PUT(request: Request) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const dates = parseDates(body.dates)
    if (!dates) {
      return NextResponse.json({ error: "dates must be a list of YYYY-MM-DD strings" }, { status: 400 })
    }

    const { isActive, startTime, endTime, timeSlots } = body
    const weekly = await getWeeklySchedule()

    const data: Record<string, unknown> = {}
    if (typeof isActive === "boolean") data.isActive = isActive
    if (typeof startTime === "string") data.startTime = startTime
    if (typeof endTime === "string") data.endTime = endTime
    if (timeSlots !== undefined) data.timeSlots = timeSlots ? JSON.stringify(timeSlots) : null

    await prisma.$transaction(async (tx) => {
      for (const date of dates) {
        const specificDate = toUTCDate(date)
        const existing = await tx.availability.findFirst({
          where: { isRecurring: false, specificDate },
          orderBy: { createdAt: "desc" },
        })

        if (existing) {
          await tx.availability.update({ where: { id: existing.id }, data })
        } else {
          // A new override starts as a copy of that weekday's weekly settings.
          const week = weekly.get(specificDate.getUTCDay())
          await tx.availability.create({
            data: {
              specificDate,
              dayOfWeek: specificDate.getUTCDay(),
              isRecurring: false,
              isActive: week?.isActive ?? true,
              startTime: week?.startTime ?? "09:00",
              endTime: week?.endTime ?? "17:00",
              timeSlots: week?.timeSlots ?? null,
              ...data,
            },
          })
        }
      }
    })

    return NextResponse.json({ success: true, updated: dates.length })
  } catch (error) {
    console.error("Failed to update date availability:", error)
    return NextResponse.json({ error: "Failed to update date availability" }, { status: 500 })
  }
}

// Admin: remove overrides so the dates follow the weekly schedule again. Body: { dates: string[] }
export async function DELETE(request: Request) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const dates = parseDates(body.dates)
    if (!dates) {
      return NextResponse.json({ error: "dates must be a list of YYYY-MM-DD strings" }, { status: 400 })
    }

    const { count } = await prisma.availability.deleteMany({
      where: { isRecurring: false, specificDate: { in: dates.map(toUTCDate) } },
    })

    return NextResponse.json({ success: true, removed: count })
  } catch (error) {
    console.error("Failed to reset date availability:", error)
    return NextResponse.json({ error: "Failed to reset date availability" }, { status: 500 })
  }
}
