"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  DashboardCircleIcon,
  Calendar01Icon,
  Calendar02Icon,
  Settings01Icon,
  Logout01Icon,
  Link01Icon,
  Menu01Icon,
  Cancel01Icon,
  Store01Icon,
  UserGroupIcon,
  Image01Icon,
} from "hugeicons-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: DashboardCircleIcon },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar01Icon },
  { href: "/admin/customers", label: "Customers", icon: UserGroupIcon },
  { href: "/admin/services", label: "Services", icon: Store01Icon },
  { href: "/admin/gallery", label: "Gallery", icon: Image01Icon },
  { href: "/admin/availability", label: "Availability", icon: Calendar02Icon },
  { href: "/admin/settings", label: "Settings", icon: Settings01Icon },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [])

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-full border border-primary/10 bg-background/80 backdrop-blur-md p-3 text-primary/70 shadow-elevated transition-all duration-300 hover:text-primary active:scale-95 lg:hidden press-effect"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <Cancel01Icon size={20} /> : <Menu01Icon size={20} />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col glass-card border-r-0 border-primary/10 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] lg:static lg:w-[280px] lg:translate-x-0 lg:my-6 lg:ml-6 lg:rounded-[32px] lg:border",
          isOpen ? "translate-x-0 rounded-r-[32px] border-r" : "-translate-x-full"
        )}
      >
        <div className="flex h-24 items-center gap-2 border-b border-primary/10 px-8">
          <Link href="/admin">
            <Image src="/logo/logo_main.png" alt="EL.AY Beauty" width={200} height={50} className="h-12 w-auto" unoptimized />
          </Link>
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-accent-dark">
            Admin
          </span>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-4 rounded-2xl px-4 py-3.5 text-[15px] font-medium transition-all duration-300 press-effect",
                  isActive
                    ? "bg-primary text-white shadow-md"
                    : "text-primary/70 hover:bg-black/5 hover:text-primary"
                )}
              >
                <Icon size={20} variant={isActive ? "solid" : "stroke"} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="space-y-2 border-t border-primary/10 px-4 py-6">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-primary/70 transition-all duration-300 hover:bg-black/5 hover:text-primary press-effect"
          >
            <Link01Icon size={20} />
            View Site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-red-500 transition-all duration-300 hover:bg-red-50 active:scale-[0.98] press-effect"
          >
            <Logout01Icon size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-30 transition-all duration-300 lg:hidden",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div
          className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      </div>
    </>
  )
}
