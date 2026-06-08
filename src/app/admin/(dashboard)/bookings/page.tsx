"use client"

import Link from "next/link"
import BookingTable from "@/components/admin/BookingTable"

export default function AdminBookingsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-xl font-bold text-primary">All Bookings</h1>
        <Link
          href="/booking"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light"
        >
          New Booking
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-soft">
        <BookingTable />
      </div>
    </div>
  )
}
