"use client"

import { useState, useEffect } from "react"

interface GalleryImage {
  id: string
  imageUrl: string
  caption: string | null
  sortOrder: number
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<GalleryImage | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/gallery")
        if (res.ok) setImages(await res.json())
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <div className="relative min-h-screen bg-background pb-20">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

      <section className="border-b border-primary/10 bg-white/40 backdrop-blur-md py-12 relative z-10 pt-32">
        <div className="container-section text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            Our Gallery
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-primary/70">
            A look at some of our recent work
          </p>
        </div>
      </section>

      <div className="container-section py-12 relative z-10">
        {loading ? (
          <p className="text-center text-muted py-16">Loading gallery...</p>
        ) : images.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-primary/50 uppercase tracking-widest">No images yet</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4 space-y-3 md:space-y-4">
            {images.map((img) => (
              <button
                key={img.id}
                onClick={() => setSelected(img)}
                className="group relative block w-full overflow-hidden rounded-2xl border border-primary/10 bg-primary/5 break-inside-avoid hover:shadow-glow transition-shadow duration-300"
              >
                <img
                  src={img.imageUrl}
                  alt={img.caption || "Gallery image"}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-sm text-white">{img.caption}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setSelected(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm font-medium"
            >
              Close
            </button>
            <img
              src={selected.imageUrl}
              alt={selected.caption || ""}
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
            {selected.caption && (
              <p className="mt-3 text-center text-sm text-white/80">{selected.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
