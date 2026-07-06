import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { google } from "googleapis"

function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) return null

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

export async function GET() {
  const token = await prisma.calendarToken.findFirst()

  if (!token) {
    return NextResponse.json({ connected: false, email: null })
  }

  let email = token.email

  if (!email) {
    const oauth2Client = getOAuthClient()
    if (oauth2Client) {
      try {
        const tokenInfo = await oauth2Client.getTokenInfo(token.accessToken)
        email = tokenInfo.email ?? null
        if (email) {
          await prisma.calendarToken.update({
            where: { id: token.id },
            data: { email },
          })
        }
      } catch {
        // token expired or invalid — email stays null
      }
    }
  }

  return NextResponse.json({ connected: true, email })
}
