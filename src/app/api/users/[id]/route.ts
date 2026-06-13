import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { discount } = body

    if (discount !== null && (typeof discount !== "number" || discount < 0 || discount > 100)) {
      return NextResponse.json({ error: "Discount must be a number between 0 and 100" }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id },
      data: { discount },
    })

    return NextResponse.json({ id: user.id, discount: user.discount })
  } catch (error) {
    console.error("Failed to update user discount:", error)
    return NextResponse.json({ error: "Failed to update user discount" }, { status: 500 })
  }
}
