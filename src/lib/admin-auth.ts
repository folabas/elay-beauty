import { NextResponse } from "next/server"
import { auth } from "@/auth"

/** Returns a 401 response when the caller isn't the logged-in admin, otherwise null. */
export async function requireAdmin() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}
