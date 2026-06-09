import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"
import os from "os"

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params
    const filePath = path.join(os.tmpdir(), "uploads", "services", filename)
    const buffer = await readFile(filePath)

    const ext = filename.split(".").pop()?.toLowerCase()
    const mime: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mime[ext || ""] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }
}
