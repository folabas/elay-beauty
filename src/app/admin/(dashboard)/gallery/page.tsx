"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Image01Icon, Delete01Icon } from "hugeicons-react"

interface GalleryImage {
  id: string
  imageUrl: string
  caption: string | null
  sortOrder: number
}

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState("")
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    loadGallery()
  }, [])

  const loadGallery = async () => {
    try {
      const res = await fetch("/api/gallery")
      if (res.ok) setImages(await res.json())
    } catch {
      showToast("Failed to load gallery")
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd })
      if (!uploadRes.ok) { showToast("Upload failed"); return }
      const { url } = await uploadRes.json()
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url, caption: caption || null }),
      })
      if (res.ok) {
        const created = await res.json()
        setImages([created, ...images])
        setCaption("")
        showToast("Image added to gallery")
      } else {
        showToast("Failed to save image")
      }
    } catch {
      showToast("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this image?")) return
    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setImages(images.filter((img) => img.id !== id))
        showToast("Image deleted")
      } else {
        showToast("Failed to delete")
      }
    } catch {
      showToast("Failed to delete")
    }
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto pb-32">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-primary">
            Gallery<span className="text-accent">.</span>
          </h1>
          <p className="mt-2 text-sm font-bold tracking-widest uppercase text-primary/50">Manage your gallery images</p>
        </div>
        <span className="rounded-full bg-accent/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-accent-dark">
          {images.length} images
        </span>
      </div>

      <div className="glass-card border border-primary/10 rounded-[32px] p-6 sm:p-8 shadow-elevated mb-8">
        <h2 className="font-serif text-xl font-bold text-primary mb-4">Add Image</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption (optional)"
              className="block w-full rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm font-medium text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
            />
          </div>
          <label className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-white hover:bg-primary-light transition-all shadow-md hover:-translate-y-1 hover:shadow-glow">
            <Image01Icon size={16} />
            {uploading ? "Uploading..." : "Choose Image"}
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
      </div>

      <div className="glass-card border border-primary/10 rounded-[32px] p-6 sm:p-8 shadow-elevated overflow-x-auto">
        {loading ? (
          <p className="text-sm text-muted text-center py-8">Loading gallery...</p>
        ) : images.length === 0 ? (
          <div className="py-16 text-center">
            <Image01Icon size={48} className="mx-auto text-primary/20" />
            <p className="mt-4 text-sm font-medium text-primary/50 uppercase tracking-widest">No images yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <div key={img.id} className="group relative rounded-2xl overflow-hidden border border-primary/10 bg-primary/5 aspect-square">
                <img src={img.imageUrl} alt={img.caption || ""} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
                {img.caption && (
                  <p className="absolute bottom-0 left-0 right-0 p-3 text-xs text-white bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {img.caption}
                  </p>
                )}
                <button
                  onClick={() => handleDelete(img.id)}
                  className="absolute top-2 right-2 rounded-full bg-red-500/80 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                >
                  <Delete01Icon size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-lg bg-primary px-4 py-3 text-center text-sm text-white shadow-elevated md:left-auto md:right-4 md:max-w-md md:text-left"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
