import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const token = await prisma.calendarToken.findFirst()
  return NextResponse.json({ connected: !!token, email: token?.email ?? null })
}
