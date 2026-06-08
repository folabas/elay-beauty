"use client"

import { useRef, useState } from "react"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import { 
  Alert02Icon, 
  Clock01Icon, 
  Cancel01Icon, 
  BankIcon, 
  Calendar01Icon, 
  TextIcon,
  PlusSignIcon,
  ArrowRight01Icon
} from "hugeicons-react"
import RotatingText from "@/components/ui/RotatingText"
import { cn } from "@/lib/utils"

const policies = [
  {
    icon: BankIcon,
    title: "Deposit Policy",
    items: [
      "A £20 deposit is required on all bookings to secure your appointment.",
      "Without a deposit, there is no booking.",
      "Deposits can be paid via bank transfer to Monzo (Elizabeth Ayedebinu, 04-00-03, 34563358, ref: Hair).",
    ],
  },
  {
    icon: Clock01Icon,
    title: "Late Arrival Policy",
    items: [
      "Arriving later than 15 minutes will result in the deposit serving as a late fee.",
      "Full payment will still be required.",
      "If arrival is more than 30 minutes late, the booking will be cancelled and the deposit will not be refunded.",
    ],
  },
  {
    icon: TextIcon,
    title: "Preparation",
    items: [
      "Ensure the correct hair material and quantity are purchased.",
      "This affects the hairstyle outcome.",
      "For assistance, contact via email before your appointment.",
    ],
  },
  {
    icon: Alert02Icon,
    title: "Pricing",
    items: [
      "Prices are fixed and non-negotiable.",
      "Discounts may be available during peak seasons (Summer and Christmas).",
      "Students receive 20% off any braiding style (valid ID required).",
    ],
  },
  {
    icon: Cancel01Icon,
    title: "Cancellation Policy",
    items: [
      "Notice must be given at least 48 hours before the appointment.",
      "Cancellations made less than 48 hours before the appointment will not receive a deposit refund.",
      "Cancellations made 48 hours or more before the appointment will receive a full deposit refund.",
    ],
  },
  {
    icon: Calendar01Icon,
    title: "Important Notes",
    items: [
      "If no listed description matches your desired hairstyle, send a message before booking.",
      "Choosing the wrong style may increase costs or cause cancellation.",
      "Clients with very short hair may incur additional costs.",
      "Changing hairstyle upon arrival may lead to increased, reduced costs, or cancellation.",
    ],
  },
]

export default function PoliciesPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!containerRef.current) return

    gsap.fromTo(
      ".hero-text",
      { filter: "blur(20px)", opacity: 0, y: 40 },
      { filter: "blur(0px)", opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: "power3.out" }
    )

    gsap.fromTo(
      ".policy-card",
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.5 }
    )
  }, { scope: containerRef })

  const [openPolicy, setOpenPolicy] = useState<number | null>(0)

  return (
    <div ref={containerRef} className="pb-32">
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden bg-background pt-24">
        <div className="absolute inset-0 bg-grid z-0 pointer-events-none" />
        <div className="container-section text-center pb-10 relative z-10 flex flex-col items-center">
          <div className="mb-8 hero-text">
            <RotatingText items={["Booking Guidelines", "Please read carefully", "Ensure smooth booking"]} />
          </div>
          <h1 className="font-serif text-5xl sm:text-7xl font-bold tracking-tight text-primary leading-[1.05] hero-text">
            Booking & <br/>
            <span className="text-accent italic font-light">Policies.</span>
          </h1>
          <p className="mx-auto mt-6 text-lg text-primary/70 max-w-xl hero-text leading-relaxed">
            Please read these policies carefully before booking your appointment to ensure the best possible experience.
          </p>
        </div>
      </section>

      <div className="container-section py-16 relative z-10">
        <div className="mx-auto max-w-3xl space-y-4">
          {policies.map((policy, index) => {
            const Icon = policy.icon
            const isOpen = openPolicy === index
            return (
              <div
                key={policy.title}
                className="policy-card rounded-2xl border border-primary/10 glass-card overflow-hidden shadow-soft transition-all duration-300 hover:border-accent/30"
              >
                <button 
                  onClick={() => setOpenPolicy(isOpen ? null : index)}
                  className="w-full px-6 py-6 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Icon size={24} variant="solid" />
                    </div>
                    <h2 className="font-serif text-xl font-bold text-primary">
                      {policy.title}
                    </h2>
                  </div>
                  <div className={cn("text-accent-dark transition-transform duration-300 shrink-0 ml-4", isOpen ? "rotate-45" : "")}>
                    <PlusSignIcon size={24} />
                  </div>
                </button>
                <div 
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-2 pl-4 sm:pl-[88px]">
                      <ul className="space-y-3">
                        {policy.items.map((item, i) => (
                          <li key={i} className="flex gap-3 text-sm text-primary/70 leading-relaxed">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
