import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, reviewNotificationEmail } from "@/lib/email"

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Failed to fetch reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { author, rating, content } = body

    if (!author || !rating || !content) {
      return NextResponse.json({ error: "Author, rating, and content are required" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const review = await prisma.review.create({
      data: {
        author,
        rating: Number(rating),
        content,
        isApproved: true,
      },
    })

    const adminEmails = (process.env.ADMIN_NOTIFY_EMAILS || process.env.ADMIN_EMAIL || "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean)

    for (const adminEmail of adminEmails) {
      await sendEmail({
        to: adminEmail,
        ...reviewNotificationEmail({ author, rating: Number(rating), content }),
      })
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error("Failed to create review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}
