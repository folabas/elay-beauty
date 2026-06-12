"use client"

import { useRef, useState, useEffect } from "react"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/dist/ScrollTrigger"
import RotatingText from "@/components/ui/RotatingText"
import Image from "next/image"
import Link from "next/link"
import { SERVICE_CATEGORIES } from "@/types"
import { SparklesIcon, UserLove01Icon, UserSquareIcon, StudentIcon, PlusSignIcon, Cancel01Icon } from "hugeicons-react"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

const categoryIcons = {
  BRAIDS: SparklesIcon,
  NATURAL: UserLove01Icon,
  CHILDREN: UserSquareIcon,
}

const categoryDescriptions = {
  BRAIDS: "Professional braiding services for all lengths and styles, tailored to protect your natural hair.",
  NATURAL: "Styling for your natural hair with care and precision to nourish your texture.",
  CHILDREN: "Gentle and stylish options for children 12 years and below, prioritizing comfort.",
}

const categoryImages = {
  BRAIDS: "/images/braids_clay_illustration_1780950883300.png",
  NATURAL: "/images/natural_clay_illustration_1780950900942.png",
  CHILDREN: "/images/children_clay_illustration_1780950913676.png",
}

const faqs = [
  { question: "How long does knotless braids usually take?", answer: "Depending on the length and size, knotless braids typically take between 8 to 12 hours. We recommend clearing your schedule for the day." },
  { question: "Do I need to wash my hair before my appointment?", answer: "Yes, please come with your hair freshly washed, detangled, and blow-dried straight with no products added." },
  { question: "Is hair included in the braiding price?", answer: "No, hair extensions are not included. We will text you after booking to confirm the exact type and amount of hair you need to purchase." },
  { question: "What if the style I want isn't listed?", answer: "Send us a message on WhatsApp and we would be happy to discuss if we offer such services and how much it will cost." },
  { question: "Do you offer emergency or squeeze-in appointments?", answer: "Squeeze-in appointments are subject to availability and incur an additional £30 premium fee. Please message us on WhatsApp to inquire." },
  { question: "What is your privacy policy?", answer: "Your personal information is collected solely for the purpose of providing our services, processing bookings, and communicating with you. We do not share your data with third parties except where required by law. By booking with us, you consent to the collection and use of your information as described in our policy." },
]

interface ServiceItem {
  id: string
  name: string
  category: string
  description: string | null
  price: number
  imageUrl: string | null
  durationRange: string | null
  requiresHairInfo: boolean
}

function PriceCard({ name, price, note, imageUrl, onClick }: { name: string; price: number; note?: string; imageUrl?: string | null; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center justify-between rounded-xl border border-primary/10 glass-card p-5 shadow-soft transition-all duration-300 hover:border-accent/30 hover:shadow-card press-effect w-full text-left">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {imageUrl && (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-primary/10 bg-background">
            <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-medium text-primary text-sm sm:text-base truncate">{name}</p>
          {note && <p className="mt-1 text-xs text-primary/60">{note}</p>}
        </div>
      </div>
      <span className="whitespace-nowrap font-mono text-lg font-bold text-accent-dark pl-4">
        £{price}
      </span>
    </button>
  )
}

export default function ServicesPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [servicesByCategory, setServicesByCategory] = useState<Record<string, ServiceItem[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch("/api/services")
        if (res.ok) {
          const all: ServiceItem[] = await res.json()
          const grouped: Record<string, ServiceItem[]> = {}
          for (const s of all.filter((s) => s.isActive !== false)) {
            if (!grouped[s.category]) grouped[s.category] = []
            grouped[s.category].push(s)
          }
          setServicesByCategory(grouped)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    loadServices()
  }, [])

  useGSAP(() => {
    if (!containerRef.current) return

    gsap.fromTo(
      ".hero-text",
      { filter: "blur(20px)", opacity: 0, y: 40 },
      { filter: "blur(0px)", opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: "power3.out" }
    )

    gsap.fromTo(".faq-item",
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.1,
        scrollTrigger: { trigger: ".faq-container", start: "top 80%" }
      }
    )
  }, { scope: containerRef, dependencies: [loading] })

  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)

  return (
    <div ref={containerRef} className="pb-32">
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-background pt-24">
        <div className="absolute inset-0 bg-grid z-0 pointer-events-none" />
        <div className="container-section relative z-10 w-full flex flex-col items-center text-center pb-20">
          <div className="max-w-4xl flex flex-col items-center">
            <div className="mb-10 hero-text">
              <RotatingText items={["Services & Pricing", "Transparent Rates", "Premium Care"]} />
            </div>
            <h1 className="font-serif text-6xl sm:text-7xl font-bold tracking-tight text-primary leading-[1.05] hero-text">
              Services & <span className="text-accent italic font-light">Pricing.</span>
            </h1>
            <p className="mt-8 text-lg sm:text-xl text-primary/70 leading-relaxed max-w-2xl hero-text">
              Transparent pricing, exceptional artistry. Browse our specialized treatments and find your perfect look.
            </p>
            <div className="mt-10 flex items-center gap-2 rounded-xl bg-accent/5 px-6 py-4 text-sm text-accent-dark w-fit border border-accent/20 hero-text shadow-glow">
              <StudentIcon size={20} className="shrink-0" />
              <span><strong>20% Student Discount</strong> off any braiding style.</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container-section mt-10 relative z-10">
        <div className="space-y-0">
          {(Object.entries(SERVICE_CATEGORIES) as [keyof typeof SERVICE_CATEGORIES, string][]).map(
            ([category, label]) => {
              const Icon = categoryIcons[category]
              const imageSrc = categoryImages[category]
              const services = servicesByCategory[category] || []

              if (services.length === 0 && !loading) return null

              return (
                <section
                  key={category}
                  id={category.toLowerCase()}
                  className="stack-section pt-4 mb-16 last:mb-10"
                >
                  <div className="w-full glass-card p-6 sm:p-12 border-t border-primary/10 shadow-elevated grid lg:grid-cols-[1fr_2fr] gap-12 items-start bg-white/70">
                    <div className="lg:sticky lg:top-32">
                      <div className="mb-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-glow">
                          <Icon size={24} variant="solid" />
                        </div>
                        <h2 className="font-serif text-3xl font-bold text-primary">
                          {label}
                        </h2>
                      </div>
                      <p className="text-primary/70 mb-8 max-w-sm">
                        {categoryDescriptions[category]}
                      </p>

                      <div className="hidden lg:block w-full h-64 relative rounded-2xl overflow-hidden bg-primary/5">
                         <Image src={imageSrc} alt={category} fill className="object-contain p-6 hover:scale-110 transition-transform duration-700" />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      {loading ? (
                        <p className="text-sm text-muted col-span-full">Loading services...</p>
                      ) : (
                        services.map((service) => (
                          <PriceCard
                            key={service.id}
                            name={service.name}
                            price={service.price}
                            note={service.description || undefined}
                            imageUrl={service.imageUrl}
                            onClick={() => setSelectedService(service)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </section>
              )
            }
          )}
        </div>
      </div>

      <section className="container-section mt-40 pt-20 border-t border-primary/10 faq-container relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 hero-text">
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-accent mb-2">Support</h2>
            <h3 className="font-serif text-4xl sm:text-5xl font-bold text-primary">
              Frequently Asked.
            </h3>
          </div>

          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6 text-sm font-medium text-amber-800 leading-relaxed">
            <strong>Important:</strong> Please book your desired hairstyle carefully, as changes cannot be accommodated once we have started or are about to begin your appointment. This helps us serve you efficiently and avoid disappointment.
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <div
                  key={index}
                  className="faq-item glass-card overflow-hidden border border-primary/10 transition-colors duration-300 hover:border-accent/30"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left"
                  >
                    <span className="font-serif text-lg font-semibold text-primary">{faq.question}</span>
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
                      <p className="px-6 pb-6 text-primary/70 text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-lg rounded-[32px] border border-primary/10 shadow-elevated overflow-hidden"
            >
              <div className="relative">
                {selectedService.imageUrl ? (
                  <div className="relative h-56 sm:h-72 w-full bg-primary/5">
                    <img src={selectedService.imageUrl} alt={selectedService.name} className="h-full w-full object-contain p-4" />
                  </div>
                ) : (
                  <div className="h-32 sm:h-40 w-full bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center">
                    <span className="text-4xl font-serif font-bold text-accent/30">{selectedService.name[0]}</span>
                  </div>
                )}
                <button
                  onClick={() => setSelectedService(null)}
                  className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-primary/70 transition-colors hover:bg-white hover:text-primary shadow-sm"
                >
                  <Cancel01Icon size={18} />
                </button>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-primary">
                    {selectedService.name}
                  </h3>
                  <span className="shrink-0 font-mono text-2xl font-bold text-accent-dark">
                    £{selectedService.price}
                  </span>
                </div>

                {selectedService.durationRange && (
                  <p className="text-[11px] font-bold uppercase tracking-widest text-primary/50 mb-3">
                    Duration: {selectedService.durationRange}
                  </p>
                )}

                {selectedService.description && (
                  <p className="text-sm text-primary/70 leading-relaxed mb-6">
                    {selectedService.description}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/booking"
                    className="flex-1 rounded-full bg-accent px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-white text-center transition-all hover:bg-accent-dark active:scale-95 shadow-md hover:-translate-y-1 hover:shadow-glow"
                  >
                    Book Now
                  </Link>
                  <button
                    onClick={() => setSelectedService(null)}
                    className="flex-1 rounded-full border border-primary/10 bg-white px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-primary/70 transition-all hover:text-primary active:scale-95 shadow-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
