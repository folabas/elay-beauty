"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services & Pricing" },
  { href: "/booking", label: "Book Now" },
  { href: "/policies", label: "Policies" },
  { href: "/contact", label: "Contact" },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav className="container-section flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-xl font-bold tracking-tight text-primary">
            EL.AY<span className="text-accent">_</span>beauty
          </span>
        </Link>

        <div className="hidden md:flex md:items-center md:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/booking"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-light"
          >
            Book Appointment
          </Link>
        </div>

        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container-section flex flex-col gap-4 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted transition-colors hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/booking"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
              onClick={() => setIsOpen(false)}
            >
              Book Appointment
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
