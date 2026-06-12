import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadToCloudinary(buffer: Buffer, filename: string) {
  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "elay-beauty/services", public_id: filename.replace(/\.[^.]+$/, "") },
      (err, result) => {
        if (err || !result) reject(err || new Error("Upload failed"))
        else resolve(result.secure_url)
      }
    )
    stream.end(buffer)
  })
}
