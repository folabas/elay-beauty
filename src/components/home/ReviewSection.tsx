"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/dist/ScrollTrigger"
import { StarIcon } from "hugeicons-react"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface Review {
  id: string
  author: string
  rating: number
  content: string
  createdAt: string
}

export default function ReviewSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [author, setAuthor] = useState("")
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState("")
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<"success" | "error">("success")
  const sectionRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!sectionRef.current) return
    const cards = gsap.utils.toArray('.review-card') as HTMLElement[]
    cards.forEach((card) => {
      gsap.fromTo(card,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 85%" } }
      )
    })
  }, { scope: sectionRef, dependencies: [reviews] })

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews")
      if (res.ok) setReviews(await res.json())
    } catch {
      console.error("Failed to load reviews")
    } finally {
      setLoading(false)
    }
  }

  const submitReview = async () => {
    if (!author.trim() || !rating || !content.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: author.trim(), rating, content: content.trim() }),
      })
      if (res.ok) {
        setMessage("Thank you! Your review has been submitted.")
        setMessageType("success")
        setAuthor("")
        setRating(0)
        setContent("")
      } else {
        setMessage("Failed to submit review. Please try again.")
        setMessageType("error")
      }
    } catch {
      setMessage("Failed to submit review. Please try again.")
      setMessageType("error")
    } finally {
      setSubmitting(false)
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const renderStars = (count: number, interactive = false) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      const filled = i <= (interactive ? hoverRating || rating : count)
      stars.push(
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setRating(i)}
          onMouseEnter={() => interactive && setHoverRating(i)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`${interactive ? "cursor-pointer" : "cursor-default"} transition-transform ${interactive ? "hover:scale-110" : ""}`}
        >
          <StarIcon
            size={interactive ? 28 : 16}
            variant={filled ? "solid" : "stroke"}
            className={filled ? "text-amber-400" : "text-primary/20"}
          />
        </button>
      )
    }
    return stars
  }

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 relative bg-card">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

      <div className="container-section relative z-10">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-accent mb-2">Testimonials</h2>
          <h3 className="font-serif text-4xl sm:text-5xl font-bold text-primary">
            What Our Clients Say.
          </h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="col-span-full text-center text-primary/50 text-sm font-bold uppercase tracking-widest py-12">
              No reviews yet. Be the first!
            </p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="review-card glass-card p-6 border border-primary/5 hover:border-accent/30 transition-all duration-500 flex flex-col">
                <div className="flex items-center gap-1 mb-3">
                  {renderStars(review.rating)}
                </div>
                <p className="text-primary/70 text-sm leading-relaxed flex-1">
                  &ldquo;{review.content}&rdquo;
                </p>
                <div className="mt-4 pt-4 border-t border-primary/5">
                  <p className="text-sm font-bold text-primary">{review.author}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-16 max-w-xl mx-auto glass-card p-8 border border-primary/5">
          <h4 className="font-serif text-2xl font-bold text-primary mb-2 text-center">Leave a Review</h4>
          <p className="text-primary/60 text-sm text-center mb-6">Share your experience with us</p>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-primary/70">Your Name *</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Sarah"
                className="block w-full rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm font-medium text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-primary/70">Rating *</label>
              <div className="flex items-center gap-1">
                {renderStars(rating, true)}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-primary/70">Your Review *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tell us about your experience..."
                rows={3}
                className="block w-full rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm font-medium text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all resize-none"
              />
            </div>

            {message && (
              <p className={`text-xs font-bold uppercase tracking-widest ${messageType === "success" ? "text-green-600" : "text-red-500"}`}>
                {message}
              </p>
            )}

            <button
              onClick={submitReview}
              disabled={submitting || !author.trim() || !rating || !content.trim()}
              className="w-full rounded-full bg-accent px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:bg-accent-dark active:scale-95 disabled:opacity-50 shadow-md hover:-translate-y-1 hover:shadow-glow press-effect"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
