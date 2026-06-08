"use client"

import Link from "next/link"
import AvailabilityEditor from "@/components/admin/AvailabilityEditor"

export default function AdminAvailabilityPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container-section flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm text-muted hover:text-primary">
              &larr; Dashboard
            </Link>
            <h1 className="font-serif text-xl font-bold text-primary">Availability</h1>
          </div>
        </div>
      </div>

      <div className="container-section py-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <AvailabilityEditor />
          </div>
        </div>
      </div>
    </div>
  )
}
