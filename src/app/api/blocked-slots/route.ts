import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const slots = await prisma.blockedSlot.findMany({
      orderBy: { date: "asc" },
    })

    const mapped = slots.map((s) => ({
      id: s.id,
      date: s.date.toISOString().split("T")[0],
      reason: s.reason,
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error("Failed to fetch blocked slots:", error)
    return NextResponse.json({ error: "Failed to fetch blocked slots" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { date, reason } = body

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }

    const slot = await prisma.blockedSlot.create({
      data: {
        date: new Date(date),
        reason: reason || null,
        startTime: "00:00",
        endTime: "23:59",
      },
    })

    return NextResponse.json({ id: slot.id, date: slot.date.toISOString().split("T")[0], reason: slot.reason })
  } catch (error) {
    console.error("Failed to create blocked slot:", error)
    return NextResponse.json({ error: "Failed to create blocked slot" }, { status: 500 })
  }
}
