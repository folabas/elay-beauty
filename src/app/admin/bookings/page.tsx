"use client"

import Link from "next/link"
import BookingTable from "@/components/admin/BookingTable"

export default function AdminBookingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container-section flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm text-muted hover:text-primary">
              &larr; Dashboard
            </Link>
            <h1 className="font-serif text-xl font-bold text-primary">All Bookings</h1>
          </div>
          <Link
            href="/booking"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light"
          >
            New Booking
          </Link>
        </div>
      </div>

      <div className="container-section py-8">
        <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
          <BookingTable />
        </div>
      </div>
    </div>
  )
}
