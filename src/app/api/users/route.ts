import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { role: "CLIENT" },
      include: {
        bookings: {
          include: { service: true },
          orderBy: { date: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const mapped = users.map((user) => {
      const totalBookings = user.bookings.length
      const completedBookings = user.bookings.filter(
        (b) => b.status === "CONFIRMED" || b.status === "COMPLETED"
      ).length
      const totalSpent = user.bookings
        .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
        .reduce((sum, b) => sum + b.totalPrice, 0)
      const lastBooking = user.bookings[0] ?? null
      const firstBooking = user.bookings[user.bookings.length - 1] ?? null

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        discount: user.discount,
        totalBookings,
        completedBookings,
        totalSpent,
        lastBookingDate: lastBooking?.date ?? null,
        firstBookingDate: firstBooking?.date ?? null,
        isReturning: completedBookings >= 1,
      }
    })

    return NextResponse.json(mapped)
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
