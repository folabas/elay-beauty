import { NextResponse } from "next/server"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.split(".").pop() || "jpg"
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const url = await uploadToCloudinary(buffer, filename)

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Upload failed:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
