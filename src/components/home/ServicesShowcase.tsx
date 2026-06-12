"use client"

import { useRef } from "react"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/dist/ScrollTrigger"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight01Icon } from "hugeicons-react"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

const categories = [
  {
    title: "Braiding",
    description: "Knotless, box braids, and elegant cornrows tailored to protect and enhance your natural beauty.",
    image: "/images/braids_clay_illustration_1780950883300.png",
    price: "From £40"
  },
  {
    title: "Natural Hair",
    description: "Silk presses, wash & blow dry, and natural styling designed to nourish your texture.",
    image: "/images/natural_clay_illustration_1780950900942.png",
    price: "From £15"
  },
  {
    title: "Children's Hair",
    description: "Gentle and fun styling for the little ones, including beads and creative cornrows.",
    image: "/images/children_clay_illustration_1780950913676.png",
    price: "From £30"
  }
]

export default function ServicesShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null)
  
  useGSAP(() => {
    if (!sectionRef.current) return
    
    const cards = gsap.utils.toArray('.service-card') as HTMLElement[]
    
    cards.forEach((card, i) => {
      gsap.fromTo(card, 
        { y: 100, opacity: 0, rotateX: 10 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          }
        }
      )
    })
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 relative bg-background">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      
      <div className="container-section relative z-10">
        <div className="max-w-2xl mb-16">
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-accent mb-2">Our Services</h2>
          <h3 className="font-serif text-4xl sm:text-5xl font-bold text-primary leading-tight">
            Elevate Your Style.
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
          {categories.map((cat, index) => (
            <div key={index} className="service-card group glass-card p-2 flex flex-col justify-between h-[480px] shadow-soft border border-primary/5 hover:border-accent/30 hover:shadow-elevated transition-all duration-500 press-effect">
              <div className="w-full h-56 relative rounded-2xl overflow-hidden bg-primary/5 group-hover:bg-primary/10 transition-colors duration-500">
                <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
                <Image 
                  src={cat.image} 
                  alt={cat.title} 
                  fill 
                  className="object-contain p-2 drop-shadow-2xl group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <h4 className="font-serif text-2xl font-bold text-primary group-hover:text-accent-dark transition-colors duration-300">{cat.title}</h4>
                  <p className="mt-3 text-primary/60 text-sm leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 mt-4">
                  <span className="font-mono text-accent-dark font-bold bg-accent/10 px-4 py-1.5 rounded-full text-xs border border-accent/20">
                    {cat.price}
                  </span>
                  <Link href="/services" className="w-12 h-12 rounded-full glass-pill flex items-center justify-center text-primary border border-primary/10 group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all duration-300 hover:scale-105 shadow-sm">
                    <ArrowRight01Icon size={20} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Link href="/booking" className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-widest font-bold text-accent-dark hover:text-primary transition-colors group">
            Book an appointment 
            <ArrowRight01Icon size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
