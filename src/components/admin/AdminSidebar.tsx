"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarRange,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShoppingBag,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/services", label: "Services", icon: ShoppingBag },
  { href: "/admin/availability", label: "Availability", icon: CalendarRange },
  { href: "/admin/settings", label: "Settings", icon: Settings },
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
        className="fixed left-4 top-4 z-50 rounded-lg border border-border bg-card p-3 text-muted shadow-soft transition-all duration-200 hover:bg-accent/5 hover:text-primary active:scale-95 lg:hidden"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-card transition-transform duration-300 ease-out lg:static lg:w-64 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <Link href="/admin" className="font-serif text-xl font-bold tracking-tight text-primary">
            EL.AY<span className="text-accent">_</span>beauty
          </Link>
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-accent-dark">
            Admin
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                  isActive
                    ? "bg-accent/10 text-accent-dark"
                    : "text-muted hover:bg-accent/5 hover:text-primary"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="space-y-1 border-t border-border px-3 py-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted transition-all duration-200 hover:bg-accent/5 hover:text-primary active:scale-[0.98]"
          >
            <ExternalLink className="h-5 w-5" />
            View Site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-500 transition-all duration-200 hover:bg-red-50 active:scale-[0.98]"
          >
            <LogOut className="h-5 w-5" />
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
