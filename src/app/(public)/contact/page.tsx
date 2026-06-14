"use client"

import { useRef, useState, useEffect } from "react"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import { Mail01Icon, SmartPhone01Icon, Location01Icon, BankIcon, Clock01Icon, Message02Icon, StarIcon, ArrowRight01Icon, ArrowLeft01Icon } from "hugeicons-react"
import RotatingText from "@/components/ui/RotatingText"
import { cn } from "@/lib/utils"

const paymentDetails = {
  bank: "Monzo",
  name: "Elizabeth Ayedebinu",
  sortCode: "04-00-03",
  accountNumber: "34563358",
  description: "Hair",
}

const reviews = [
  { name: "Sarah M.", text: "Absolutely loved my knotless braids! Elizabeth was incredibly gentle and the parts are so neat. Best braiding experience in London.", rating: 5 },
  { name: "Chloe T.", text: "My daughter usually cries when getting her hair done, but she was so relaxed here. The children's styling is top tier.", rating: 5 },
  { name: "Jessica R.", text: "The silk press lasted weeks! Such a premium service and beautiful environment. Highly recommend.", rating: 5 },
]

export default function ContactPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!containerRef.current) return

    gsap.fromTo(
      ".hero-text",
      { filter: "blur(20px)", opacity: 0, y: 40 },
      { filter: "blur(0px)", opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: "power3.out" }
    )

    gsap.fromTo(
      ".contact-card",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.5 }
    )
  }, { scope: containerRef })

  const [activeReview, setActiveReview] = useState(0)

  const nextReview = () => setActiveReview(p => (p + 1) % reviews.length)
  const prevReview = () => setActiveReview(p => (p - 1 + reviews.length) % reviews.length)

  useEffect(() => {
    const interval = setInterval(nextReview, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div ref={containerRef} className="pb-32">
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden bg-background pt-24">
        <div className="absolute inset-0 bg-grid z-0 pointer-events-none" />
        <div className="container-section text-center pb-10 relative z-10 flex flex-col items-center">
          <div className="mb-8 hero-text">
            <RotatingText items={["Contact & Payment", "Get in touch today", "Secure your booking"]} />
          </div>
          <h1 className="font-serif text-5xl sm:text-7xl font-bold tracking-tight text-primary leading-[1.05] hero-text">
            Contact & <br/>
            <span className="text-accent italic font-light">Payment.</span>
          </h1>
          <p className="mx-auto mt-6 text-lg text-primary/70 max-w-xl hero-text leading-relaxed">
            Get in touch for consultations, or send your deposit to secure your booking. We're here to assist you.
          </p>
        </div>
      </section>

      <div className="container-section py-16 relative z-10">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
          {/* Left Column - Contact Details */}
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-primary hero-text">
              Get in Touch
            </h2>
            <p className="text-primary/70 text-sm hero-text">
              Have a question about a style or need help choosing? Send us a message before booking.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-xl border border-primary/10 glass-card p-5 contact-card transition-all hover:border-accent/30 press-effect hover:shadow-card">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Mail01Icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">Email</p>
                  <a href="mailto:Iretomiwaelizabeth474@gmail.com" className="text-sm text-primary/70 transition-colors hover:text-accent">
                    Iretomiwaelizabeth474@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-primary/10 glass-card p-5 contact-card transition-all hover:border-accent/30 press-effect hover:shadow-card">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Message02Icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">WhatsApp</p>
                  <a href="https://wa.link/wycx8l" target="_blank" rel="noopener noreferrer" className="text-sm text-primary/70 transition-colors hover:text-accent">
                    Chat with us instantly
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-primary/10 glass-card p-5 contact-card transition-all hover:border-accent/30 press-effect hover:shadow-card">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Location01Icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">Location</p>
                  <p className="text-sm text-primary/70">London, UK</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-primary/10 glass-card p-5 contact-card transition-all hover:border-accent/30 press-effect hover:shadow-card">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Clock01Icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">Available Hours</p>
                  <div className="mt-1 space-y-0.5 text-xs text-primary/70">
                    <p>Friday: 5:00 PM – 7:00 PM</p>
                    <p>Saturday: 7:00 AM – 9:00 AM</p>
                    <p>Sunday: 3:00 PM – 5:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment & QR */}
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-primary hero-text">
              Deposit Payment
            </h2>
            <p className="text-primary/70 text-sm hero-text">
              A £20 deposit is required on all bookings. Send your deposit to the account below:
            </p>

            <div className="rounded-2xl border border-primary/10 glass-card p-8 shadow-elevated contact-card">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-glow">
                  <BankIcon size={28} variant="solid" />
                </div>
                <div>
                  <p className="text-lg font-bold text-primary">{paymentDetails.bank}</p>
                  <p className="text-sm text-primary/60">Bank Transfer</p>
                </div>
              </div>

              <div className="space-y-4 border-t border-primary/10 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-primary/60">Account Name</span>
                  <span className="font-bold text-primary">{paymentDetails.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary/60">Sort Code</span>
                  <span className="font-mono font-bold text-primary">{paymentDetails.sortCode}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary/60">Account Number</span>
                  <span className="font-mono font-bold text-primary">{paymentDetails.accountNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary/60">Reference</span>
                  <span className="font-bold text-accent-dark">{paymentDetails.description}</span>
                </div>
              </div>
            </div>

            <p className="rounded-xl bg-accent/5 p-4 text-xs text-primary/70 border border-accent/20 contact-card leading-relaxed">
              <strong>Notice:</strong> After sending your deposit, your booking will be confirmed. Please use the reference <strong>Hair</strong> so we can easily identify your payment.
            </p>
          </div>
        </div>

        {/* Social Proof Carousel */}
        <div className="mt-32 max-w-4xl mx-auto contact-card">
          <div className="text-center mb-12">
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-accent mb-2">Testimonials</h2>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-primary">
              Client Love.
            </h3>
          </div>

          <div className="relative glass-card border border-primary/10 rounded-3xl p-8 sm:p-12 shadow-elevated h-[350px] sm:h-[250px] flex items-center justify-center overflow-hidden">
            {reviews.map((review, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "absolute inset-0 p-8 sm:p-12 flex flex-col items-center justify-center text-center transition-all duration-700 ease-in-out",
                  idx === activeReview ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 translate-x-8 pointer-events-none"
                )}
              >
                <div className="flex gap-1 text-accent mb-6">
                  {[1,2,3,4,5].map(i => <StarIcon key={i} size={20} variant="solid" />)}
                </div>
                <p className="font-serif text-xl sm:text-2xl text-primary leading-relaxed italic mb-6">
                  "{review.text}"
                </p>
                <p className="font-mono text-sm font-bold text-primary/60 uppercase tracking-widest">
                  — {review.name}
                </p>
              </div>
            ))}

            <button onClick={prevReview} className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-pill flex items-center justify-center text-primary/50 hover:text-primary transition-colors press-effect z-10 shadow-soft">
              <ArrowLeft01Icon size={20} />
            </button>
            <button onClick={nextReview} className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-pill flex items-center justify-center text-primary/50 hover:text-primary transition-colors press-effect z-10 shadow-soft">
              <ArrowRight01Icon size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
