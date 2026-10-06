import { NextResponse } from "next/server"
import { getAuthUrl } from "@/lib/google-calendar"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET() {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  const url = getAuthUrl()
  return NextResponse.redirect(url)
}
