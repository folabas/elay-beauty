"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useRef } from "react"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/dist/ScrollTrigger"
import { InstagramIcon, TiktokIcon, Mail01Icon, WhatsappIcon } from "hugeicons-react"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Footer() {
  const pathname = usePathname()
  const footerRef = useRef<HTMLDivElement>(null)
  
  useGSAP(() => {
    if (!footerRef.current) return
    
    gsap.from(".footer-stagger", {
      scrollTrigger: {
        trigger: footerRef.current,
        start: "top 80%",
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out"
    })
  }, { scope: footerRef })

  // Don't show complex footer on booking page to keep focus on flow
  if (pathname === "/booking") {
    return (
      <footer className="py-6 flex flex-col items-center gap-2 text-center text-xs text-muted">
        <div>&copy; {new Date().getFullYear()} EL.AY Beauty</div>
        <div>Sponsored by <a href="https://waltiklabs.vercel.app" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary transition-colors">Waltik Labs</a></div>
      </footer>
    )
  }

  return (
    <footer ref={footerRef} className="relative bg-primary text-white overflow-hidden pt-24 pb-8 rounded-t-[40px] mt-24">
      {/* Taped effect overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-12 bg-white/10 backdrop-blur-sm rotate-2 shadow-lg z-10" />
      
      <div className="container-section relative z-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="footer-stagger">
            <Image src="/logo/logo_main.png" alt="EL.AY Beauty" width={280} height={70} className="h-12 w-auto mb-4 brightness-0 invert" unoptimized />
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              Premium hair braiding and natural styling services crafted with precision and care.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-primary transition-all press-effect">
                <InstagramIcon size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-primary transition-all press-effect">
                <TiktokIcon size={20} />
              </a>
            </div>
          </div>

          <div className="footer-stagger">
            <h4 className="text-xs font-bold uppercase tracking-widest text-accent mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {[
                { href: "/services", label: "Services & Pricing" },
                { href: "/booking", label: "Book Appointment" },
                { href: "/policies", label: "Policies" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white hover:translate-x-1 inline-block transition-transform">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-stagger">
            <h4 className="text-xs font-bold uppercase tracking-widest text-accent mb-6">Hours</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span>Friday</span> <span className="text-white">5pm – 7pm</span>
              </li>
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span>Saturday</span> <span className="text-white">7am – 9am</span>
              </li>
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span>Sunday</span> <span className="text-white">3pm – 5pm</span>
              </li>
            </ul>
          </div>

          <div className="footer-stagger">
            <h4 className="text-xs font-bold uppercase tracking-widest text-accent mb-6">Connect</h4>
            <ul className="space-y-4">
              <li>
                <a href="mailto:Iretomiwaelizabeth474@gmail.com" className="group flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors">
                  <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent group-hover:text-primary transition-colors">
                    <Mail01Icon size={16} />
                  </span>
                  Email Us
                </a>
              </li>
              <li>
                <a href="https://wa.link/wycx8l" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors">
                  <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                    <WhatsappIcon size={16} />
                  </span>
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Massive Brand Name */}
        <div className="footer-stagger flex flex-col justify-center items-center w-full overflow-hidden relative -mt-4">
          <Image src="/logo/logo.png" alt="EL.AY Beauty" width={400} height={120} className="w-[34vw] max-w-[500px] h-auto opacity-5 -mb-8" />
          <div className="w-full flex flex-col sm:flex-row justify-between items-center text-xs text-white/40 mt-12 gap-2 relative z-10">
            <span>&copy; {new Date().getFullYear()} EL.AY Beauty. All rights reserved.</span>
            <span>Sponsored by <a href="https://waltiklabs.vercel.app" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">Waltik Labs</a></span>
            <span>Student discount: 20% off</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
