import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ discount: null })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.discount) {
      return NextResponse.json({ discount: null })
    }

    const completedBookings = await prisma.booking.count({
      where: {
        clientId: user.id,
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
    })

    return NextResponse.json({
      discount: user.discount,
      visitCount: completedBookings,
    })
  } catch (error) {
    console.error("Failed to check discount:", error)
    return NextResponse.json({ discount: null })
  }
}
