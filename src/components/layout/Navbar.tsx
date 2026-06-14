"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useRef } from "react"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/dist/ScrollTrigger"
import { 
  Home01Icon, 
  SparklesIcon, 
  Image01Icon,
  Calendar01Icon, 
  BookOpen01Icon, 
  Mail01Icon, 
  PanelLeftOpenIcon,
  Cancel01Icon,
  ArrowDown01Icon
} from "hugeicons-react"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

const navLinks = [
  { href: "/", label: "Home", Icon: Home01Icon },
  { 
    href: "/services", 
    label: "Services", 
    Icon: SparklesIcon,
    subItems: [
      { label: "Braids", href: "/services#braids" },
      { label: "Natural Hair", href: "/services#natural" },
      { label: "Children's Hair", href: "/services#children" },
    ]
  },
  { href: "/gallery", label: "Gallery", Icon: Image01Icon },
  { href: "/booking", label: "Book", Icon: Calendar01Icon },
  { href: "/policies", label: "Policies", Icon: BookOpen01Icon },
  { href: "/contact", label: "Contact", Icon: Mail01Icon },
]

export default function Navbar() {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (!navRef.current || !headerRef.current) return

    ScrollTrigger.create({
      start: "top -50",
      end: 99999,
      toggleClass: { className: "desktop-nav-scrolled", targets: navRef.current },
    })

    ScrollTrigger.create({
      start: "top -50",
      end: 99999,
      toggleClass: { className: "fixed-header", targets: headerRef.current },
    })
  }, { scope: navRef })

  return (
    <>
      {/* Desktop Navbar */}
      <header 
        ref={headerRef}
        className="absolute top-0 left-0 right-0 z-50 hidden md:block pt-6 px-4 pointer-events-none
          [&.fixed-header]:fixed [&.fixed-header]:pt-0"
      >
        <div 
          ref={navRef}
          className="container-section mx-auto transition-all duration-500 ease-out pointer-events-auto max-w-6xl
            [&.desktop-nav-scrolled]:max-w-4xl [&.desktop-nav-scrolled]:glass-pill [&.desktop-nav-scrolled]:py-4 [&.desktop-nav-scrolled]:px-6 [&.desktop-nav-scrolled]:mt-4
            py-4 px-4 sm:px-6 flex items-center relative"
        >
          <Link href="/" className="flex items-center gap-2 group shrink-0 z-10">
            <Image src="/logo/logo_main.png" alt="EL.AY Beauty" width={240} height={60} className="h-14 w-auto transition-transform group-hover:scale-105" priority />
          </Link>

          <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/")
              
              return (
                <div 
                  key={link.href} 
                  className="relative group"
                  onMouseEnter={() => setHoveredLink(link.label)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:bg-black/5 press-effect",
                      isActive ? "text-accent-dark bg-accent/10" : "text-primary/70 hover:text-primary"
                    )}
                  >
                    {link.label}
                    {link.subItems && (
                      <ArrowDown01Icon size={16} className="transition-transform group-hover:rotate-180" />
                    )}
                  </Link>

                  {/* Dropdown Card */}
                  {link.subItems && (
                    <div 
                      className={cn(
                        "absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-300 pointer-events-none",
                        hoveredLink === link.label ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-4"
                      )}
                    >
                      <div className="glass-card w-48 p-2 flex flex-col gap-1 shadow-elevated border border-primary/10">
                        {link.subItems.map(sub => (
                          <Link 
                            key={sub.label} 
                            href={sub.href}
                            onClick={() => setHoveredLink(null)}
                            className="px-4 py-2.5 rounded-lg text-sm text-primary/70 hover:text-primary hover:bg-primary/5 transition-colors"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Mobile Top Navbar */}
      <div className="fixed top-6 left-0 right-0 z-50 md:hidden px-4 pointer-events-none flex justify-center items-start gap-3">
        {/* Sidebar Trigger (Outside Pill) */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="pointer-events-auto h-14 w-14 rounded-full glass-pill flex items-center justify-center text-primary shadow-elevated press-effect hover:scale-105 transition-transform shrink-0"
        >
          <PanelLeftOpenIcon size={24} />
        </button>

        {/* Main Pill */}
        <nav className="pointer-events-auto h-14 glass-pill flex items-center px-3 shadow-elevated overflow-x-auto no-scrollbar gap-2 shrink-0">
          {navLinks.slice(0, 4).map((link) => {
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/")
            const Icon = link.Icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center justify-center h-10 rounded-full transition-all duration-300 press-effect shrink-0",
                  isActive ? "bg-primary text-white px-4 gap-2" : "text-primary/60 hover:text-primary hover:bg-black/5 w-10 px-0"
                )}
              >
                <Icon size={20} variant={isActive ? "solid" : "stroke"} />
                {isActive && (
                  <span className="text-sm font-medium pr-1 whitespace-nowrap">{link.label}</span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Mobile Sidebar Overlay (Always in DOM for smooth animation) */}
      <div className={`fixed inset-0 z-[100] md:hidden transition-opacity duration-500 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div 
          className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
        
        {/* Floating Pill Sidebar */}
        <div className={`absolute top-4 left-4 bottom-28 w-[280px] bg-background/95 backdrop-blur-xl shadow-elevated p-6 flex flex-col rounded-[40px] border border-primary/10 overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[150%]'}`}>
          <div className="flex justify-between items-center mb-10 pl-2">
            <Image src="/logo/logo_main.png" alt="EL.AY Beauty" width={200} height={50} className="h-12 w-auto" />
            
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-full hover:bg-black/5 text-primary/60 hover:text-primary transition-colors press-effect"
            >
              <Cancel01Icon size={24} />
            </button>
          </div>
          <nav className="flex flex-col gap-2 overflow-y-auto no-scrollbar">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/")
              const Icon = link.Icon
              return (
                <div key={link.href} className="flex flex-col">
                  <Link
                    href={link.href}
                    onClick={() => !link.subItems && setIsSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-4 rounded-2xl text-lg font-medium transition-all duration-300 press-effect",
                      isActive ? "bg-primary text-white shadow-md scale-100" : "text-primary/70 hover:bg-black/5 hover:text-primary"
                    )}
                  >
                    <Icon size={24} variant={isActive ? "solid" : "stroke"} />
                    {link.label}
                  </Link>
                  {/* Mobile Submenu */}
                  {link.subItems && isActive && (
                    <div className="ml-12 mt-2 flex flex-col gap-2 border-l border-primary/10 pl-4">
                      {link.subItems.map(sub => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          onClick={() => setIsSidebarOpen(false)}
                          className="text-primary/60 hover:text-primary py-2 text-sm font-medium transition-colors"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}
