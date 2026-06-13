import Link from "next/link"
import { prisma } from "@/lib/prisma"
import BookingTable from "@/components/admin/BookingTable"

function formatDate(date: Date) {
  return date.toISOString().split("T")[0]
}

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: true, service: true },
  })

  const mapped = bookings.map((b) => ({
    id: b.id,
    client: b.client.name,
    email: b.client.email,
    phone: b.client.phone,
    service: b.service.name,
    hairLength: b.hairLength,
    hairType: b.hairType,
    notes: b.notes,
    isStudent: b.isStudent,
    cancellationReason: b.cancellationReason,
    date: formatDate(b.date),
    time: b.time,
    price: b.totalPrice,
    depositPaid: b.depositPaid,
    status: b.status === "PENDING_DEPOSIT" ? "Pending" as const
          : b.status === "CONFIRMED" ? "Confirmed" as const
          : b.status === "COMPLETED" ? "Completed" as const
          : "Cancelled" as const,
  }))

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto pb-32">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-primary">
          All Bookings<span className="text-accent">.</span>
        </h1>
        <Link
          href="/booking"
          className="rounded-full bg-primary px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-white hover:bg-primary-light transition-all shadow-md hover:-translate-y-1 hover:shadow-glow"
        >
          New Booking
        </Link>
      </div>

      <div className="mt-8 glass-card border border-primary/10 rounded-[32px] p-6 sm:p-8 shadow-elevated overflow-x-auto">
        <BookingTable bookings={mapped} />
      </div>
    </div>
  )
}
