import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET() {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  const token = await prisma.calendarToken.findFirst()
  return NextResponse.json({ connected: !!token, email: token?.email ?? null })
}
