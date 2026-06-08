"use client"

import Link from "next/link"
import { useRef } from "react"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import RotatingText from "@/components/ui/RotatingText"
import { ArrowRight01Icon } from "hugeicons-react"

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline()

    // Blur in text effect
    tl.fromTo(
      ".hero-text",
      { filter: "blur(20px)", opacity: 0, y: 40 },
      { filter: "blur(0px)", opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: "power3.out" }
    )
    .fromTo(
      ".hero-btn",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)" },
      "-=0.6"
    )
  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background pt-16">
      <div className="absolute inset-0 bg-grid z-0 pointer-events-none" />
      
      <div className="container-section relative z-10 w-full flex flex-col items-center text-center">
        {/* Editorial Text Side */}
        <div className="max-w-5xl pb-20 flex flex-col items-center">
          <div className="mb-6 mt-6 hero-text">
            <RotatingText items={["Taking Bookings Now", "Premium Hair Styling", "Elevate Your Style"]} />
          </div>
          
          <h1 className="font-serif text-6xl sm:text-8xl lg:text-[8rem] font-bold tracking-tight text-primary leading-[1.05] hero-text">
            Crafting <span className="text-accent italic font-light">Elegance</span> <br/>
            in Every Strand.
          </h1>
          
          <p className="mt-8 text-lg sm:text-xl text-primary/70 leading-relaxed max-w-2xl hero-text font-medium">
            Premium hair braiding, natural styling, and children's care by EL.AY Beauty. Where artistry meets effortless booking.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 hero-btn w-full sm:w-auto justify-center">
            <Link
              href="/booking"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-semibold text-white shadow-elevated transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-glow press-effect group"
            >
              Book Appointment
              <ArrowRight01Icon size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/services"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full glass-card px-8 text-sm font-semibold text-primary transition-all duration-300 hover:bg-white hover:-translate-y-2 hover:shadow-lg press-effect group"
            >
              Explore Services
              <ArrowRight01Icon size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
        </div>
      </div>
    </section>
  )
}
