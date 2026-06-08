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
        <BookingTable bookings={mapped} />
      </div>
    </div>
  )
}
