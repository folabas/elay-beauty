<<<<<<< HEAD
"use client"

import { useRef, useState } from "react"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/dist/ScrollTrigger"
import RotatingText from "@/components/ui/RotatingText"
import Image from "next/image"
import { PRICE_LIST, SERVICE_CATEGORIES } from "@/types"
import { SparklesIcon, UserLove01Icon, UserSquareIcon, StudentIcon, PlusSignIcon } from "hugeicons-react"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}
=======
import { PRICE_LIST, SERVICE_CATEGORIES, SERVICE_IMAGES } from "@/types"
import { Sparkles, Heart, Baby, GraduationCap } from "lucide-react"
>>>>>>> bd20a014556ce51102acd0a7fb382603a0eaf3ea

const categoryIcons = {
  BRAIDS: SparklesIcon,
  NATURAL: UserLove01Icon,
  CHILDREN: UserSquareIcon,
}

const categoryDescriptions = {
  BRAIDS: "Professional braiding services for all lengths and styles, tailored to protect your natural hair.",
  NATURAL: "Styling for your natural hair with care and precision to nourish your texture.",
  CHILDREN: "Gentle and stylish options for children of all ages, prioritizing comfort.",
}

<<<<<<< HEAD
const categoryImages = {
  BRAIDS: "/images/braids_clay_illustration_1780950883300.png",
  NATURAL: "/images/natural_clay_illustration_1780950900942.png",
  CHILDREN: "/images/children_clay_illustration_1780950913676.png",
}

const faqs = [
  { question: "How long does knotless braiding usually take?", answer: "Depending on the length and size, knotless braids typically take between 4 to 7 hours. We recommend clearing your schedule for the day." },
  { question: "Do I need to wash my hair before my appointment?", answer: "Yes, please come with your hair freshly washed, detangled, and blow-dried straight with no products added, unless you've booked our wash and blow-dry service." },
  { question: "Is hair included in the braiding price?", answer: "No, hair extensions are not included. We will email you after booking to confirm the exact type and amount of hair you need to purchase." },
  { question: "Do you offer emergency or squeeze-in appointments?", answer: "Squeeze-in appointments are subject to availability and incur an additional £30 premium fee. Please message us on WhatsApp to inquire." },
]

function PriceCard({ name, price, note }: { name: string; price: number; note?: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-primary/10 glass-card p-5 shadow-soft transition-all duration-300 hover:border-accent/30 hover:shadow-card press-effect">
      <div>
        <p className="font-medium text-primary text-sm sm:text-base">{name}</p>
        {note && <p className="mt-1 text-xs text-primary/60">{note}</p>}
=======
function PriceCard({
  name,
  price,
  note,
}: {
  name: string
  price: number
  note?: string
}) {
  const imgSrc = SERVICE_IMAGES[name]
  return (
    <div className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-soft transition-all hover:border-accent/30 hover:shadow-card">
      <div className="flex items-center gap-4">
        {imgSrc && (
          <img
            src={imgSrc}
            alt={name}
            className="h-16 w-16 shrink-0 rounded-lg object-cover"
          />
        )}
        <div>
          <p className="font-medium text-primary">{name}</p>
          {note && <p className="mt-0.5 text-xs text-muted">{note}</p>}
        </div>
>>>>>>> bd20a014556ce51102acd0a7fb382603a0eaf3ea
      </div>
      <span className="whitespace-nowrap font-mono text-lg font-bold text-accent-dark pl-4">
        £{price}
      </span>
    </div>
  )
}

export default function ServicesPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!containerRef.current) return

    // Hero Text Blur In
    gsap.fromTo(
      ".hero-text",
      { filter: "blur(20px)", opacity: 0, y: 40 },
      { filter: "blur(0px)", opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: "power3.out" }
    )

    // FAQ entrance
    gsap.fromTo(".faq-item",
      { opacity: 0, y: 20 },
      { 
        opacity: 1, y: 0, duration: 0.8, stagger: 0.1, 
        scrollTrigger: { trigger: ".faq-container", start: "top 80%" }
      }
    )

  }, { scope: containerRef })

  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div ref={containerRef} className="pb-32">
      {/* Editorial Hero */}
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

      {/* Scroll Stacks */}
      <div className="container-section mt-10 relative z-10">
        <div className="space-y-0">
          {(Object.entries(PRICE_LIST) as [keyof typeof PRICE_LIST, typeof PRICE_LIST[keyof typeof PRICE_LIST]][]).map(
            ([category, services], index) => {
              const Icon = categoryIcons[category]
              const imageSrc = categoryImages[category]
              
              return (
                <section 
                  key={category} 
                  id={category.toLowerCase()}
                  className="stack-section pt-4 mb-16 last:mb-10"
                >
                  <div className="w-full glass-card p-6 sm:p-12 border-t border-primary/10 shadow-elevated grid lg:grid-cols-[1fr_2fr] gap-12 items-start bg-white/70">
                    
                    {/* Sticky Sidebar per section */}
                    <div className="lg:sticky lg:top-32">
                      <div className="mb-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-glow">
                          <Icon size={24} variant="solid" />
                        </div>
                        <h2 className="font-serif text-3xl font-bold text-primary">
                          {SERVICE_CATEGORIES[category]}
                        </h2>
                      </div>
                      <p className="text-primary/70 mb-8 max-w-sm">
                        {categoryDescriptions[category]}
                      </p>
                      
                      <div className="hidden lg:block w-full h-64 relative rounded-2xl overflow-hidden bg-primary/5">
                         <Image src={imageSrc} alt={category} fill className="object-contain p-6 hover:scale-110 transition-transform duration-700" />
                      </div>
                    </div>

                    {/* Pricing List */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      {services.map((service) => (
                        <PriceCard
                          key={service.name}
                          name={service.name}
                          price={service.price}
                          note={"note" in service ? (service as { name: string; price: number; note: string }).note : undefined}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              )
            }
          )}
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <section className="container-section mt-40 pt-20 border-t border-primary/10 faq-container relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 hero-text">
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-accent mb-2">Support</h2>
            <h3 className="font-serif text-4xl sm:text-5xl font-bold text-primary">
              Frequently Asked.
            </h3>
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
    </div>
  )
}
