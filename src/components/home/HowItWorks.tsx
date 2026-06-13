"use client"

import { useRef } from "react"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/dist/ScrollTrigger"
import { Search01Icon, Calendar01Icon, CheckmarkBadge01Icon } from "hugeicons-react"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

const steps = [
  {
    icon: Search01Icon,
    title: "Choose Your Style",
    desc: "Browse our comprehensive list of braiding and natural hair services to find your perfect look.",
  },
  {
    icon: Calendar01Icon,
    title: "Pick a Time",
    desc: "Select a date and time that works for you. Note that Sundays are reserved exclusively for hairstyles under the natural hair section.",
  },
  {
    icon: CheckmarkBadge01Icon,
    title: "Secure & Confirm",
    desc: "Fill in your details and pay a £20 deposit via bank transfer to confirm your appointment.",
  },
]

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!sectionRef.current) return

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top center",
        end: "bottom center",
        scrub: 1,
      }
    })

    // Animate the progress line
    timeline.fromTo(".progress-line", 
      { height: "0%" },
      { height: "100%", ease: "none" }
    )

    // Fade in steps
    const stepEls = gsap.utils.toArray('.step-item') as HTMLElement[]
    stepEls.forEach((step) => {
      gsap.from(step, {
        opacity: 0,
        x: -30,
        scrollTrigger: {
          trigger: step,
          start: "top 70%",
          toggleActions: "play none none reverse"
        }
      })
    })

  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 relative bg-card">
      <div className="container-section">
        <div className="max-w-2xl mx-auto text-center mb-20">
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-accent mb-2">Process</h2>
          <h3 className="font-serif text-4xl sm:text-5xl font-bold text-primary">
            How It Works.
          </h3>
        </div>

        <div className="max-w-3xl mx-auto relative pl-8 sm:pl-0">
          {/* Progress Line */}
          <div className="absolute left-8 sm:left-1/2 top-0 bottom-0 w-px bg-primary/10 -translate-x-1/2">
            <div className="progress-line w-full bg-accent origin-top" />
          </div>

          <div className="space-y-24">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isEven = index % 2 === 0
              return (
                <div key={index} className={`step-item relative flex items-center ${isEven ? 'sm:flex-row-reverse' : 'sm:flex-row'} sm:justify-between`}>
                  
                  {/* Icon Node */}
                  <div className="absolute left-0 sm:left-1/2 w-12 h-12 bg-card border-2 border-accent rounded-full -translate-x-1/2 flex items-center justify-center z-10 shadow-glow">
                    <Icon size={20} className="text-accent-dark" variant="solid" />
                  </div>

                  {/* Content Card */}
                  <div className={`w-full sm:w-[45%] pl-8 sm:pl-0 ${isEven ? 'sm:text-left' : 'sm:text-right'}`}>
                    <div className="glass-card p-8 glass-card-hover text-left">
                      <div className="font-mono text-xs font-bold text-accent mb-2 opacity-60">STEP 0{index + 1}</div>
                      <h4 className="font-serif text-2xl font-bold text-primary mb-3">{step.title}</h4>
                      <p className="text-primary/70 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
