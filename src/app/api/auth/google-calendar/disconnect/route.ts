import { NextResponse } from "next/server"
import { disconnectCalendar } from "@/lib/google-calendar"

export async function POST() {
  try {
    await disconnectCalendar()
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Failed to disconnect calendar:", err)
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 })
  }
}
