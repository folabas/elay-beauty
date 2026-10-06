import { NextResponse } from "next/server"
import { disconnectCalendar } from "@/lib/google-calendar"
import { requireAdmin } from "@/lib/admin-auth"

export async function POST() {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    await disconnectCalendar()
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Failed to disconnect calendar:", err)
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 })
  }
}
