"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { StarIcon } from "hugeicons-react"

interface Review {
  id: string
  author: string
  rating: number
  content: string
  createdAt: string
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      const res = await fetch("/api/reviews")
      if (res.ok) setReviews(await res.json())
    } catch {
      showToast("Failed to load reviews")
    } finally {
      setLoading(false)
    }
  }

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return
    try {
      const res = await fetch(`/api/reviews/admin?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setReviews(reviews.filter((r) => r.id !== id))
        showToast("Review deleted")
      } else {
        showToast("Failed to delete review")
      }
    } catch {
      showToast("Failed to delete review")
    }
  }

  const renderStars = (count: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <StarIcon
          key={i}
          size={14}
          variant={i <= count ? "solid" : "stroke"}
          className={i <= count ? "text-amber-400" : "text-primary/20"}
        />
      )
    }
    return stars
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm text-muted">Loading reviews...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto pb-32">
      <div className="mb-8">
        <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-primary">
          Reviews<span className="text-accent">.</span>
        </h1>
        <p className="mt-2 text-sm font-bold tracking-widest uppercase text-primary/50">
          {reviews.length} review{reviews.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {reviews.length === 0 ? (
        <p className="text-[11px] font-bold uppercase tracking-widest text-primary/50 text-center py-8">No reviews yet</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="glass-card p-6 border border-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-primary text-sm">{review.author}</span>
                <div className="flex items-center gap-0.5 ml-auto">{renderStars(review.rating)}</div>
              </div>
              <p className="text-primary/60 text-sm leading-relaxed">&ldquo;{review.content}&rdquo;</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-primary/5">
                <p className="text-[10px] font-medium uppercase tracking-widest text-primary/40">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
                <button
                  onClick={() => deleteReview(review.id)}
                  className="rounded-full bg-red-50 text-red-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-red-500 hover:text-white active:scale-95 press-effect"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
