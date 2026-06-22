import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    })
    return NextResponse.json(images)
  } catch (error) {
    console.error("Failed to fetch gallery:", error)
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { imageUrl, caption } = body

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    const count = await prisma.galleryImage.count()
    const image = await prisma.galleryImage.create({
      data: {
        imageUrl,
        caption: caption || null,
        sortOrder: count,
      },
    })

    return NextResponse.json(image)
  } catch (error) {
    console.error("Failed to create gallery image:", error)
    return NextResponse.json({ error: "Failed to create gallery image" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Image ID is required" }, { status: 400 })
    }

    await prisma.galleryImage.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete gallery image:", error)
    return NextResponse.json({ error: "Failed to delete gallery image" }, { status: 500 })
  }
}
