import { NextRequest, NextResponse } from "next/server"
import { saveTokensFromCode } from "@/lib/google-calendar"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const error = request.nextUrl.searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(new URL("/admin/settings?error=access_denied", request.url))
  }

  try {
    await saveTokensFromCode(code)
    return NextResponse.redirect(new URL("/admin/settings?success=connected", request.url))
  } catch (err) {
    console.error("Google Calendar OAuth callback failed:", err)
    return NextResponse.redirect(new URL("/admin/settings?error=token_exchange_failed", request.url))
  }
}
