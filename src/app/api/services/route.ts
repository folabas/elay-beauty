import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    })
    return NextResponse.json(services)
  } catch (error) {
    console.error("Failed to fetch services:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, category, price, description, duration, requiresHairInfo, imageUrl } = body

    if (!name || !category || price === undefined) {
      return NextResponse.json({ error: "Name, category, and price are required" }, { status: 400 })
    }

    const service = await prisma.service.create({
      data: {
        name,
        category,
        price: Number(price),
        description: description || null,
        duration: duration ? Number(duration) : null,
        requiresHairInfo: requiresHairInfo !== false,
        imageUrl: imageUrl || null,
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error("Failed to create service:", error)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, category, price, description, duration, requiresHairInfo, isActive, imageUrl } = body

    if (!id) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 })
    }

    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name
    if (category !== undefined) data.category = category
    if (price !== undefined) data.price = Number(price)
    if (description !== undefined) data.description = description
    if (duration !== undefined) data.duration = duration ? Number(duration) : null
    if (requiresHairInfo !== undefined) data.requiresHairInfo = requiresHairInfo
    if (isActive !== undefined) data.isActive = isActive
    if (imageUrl !== undefined) data.imageUrl = imageUrl

    const service = await prisma.service.update({ where: { id }, data })
    return NextResponse.json(service)
  } catch (error) {
    console.error("Failed to update service:", error)
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 })
    }

    await prisma.service.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete service:", error)
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
  }
}
