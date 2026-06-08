"use client"

import { useState } from "react"
import CancelBookingDialog from "./CancelBookingDialog"

interface Booking {
  id: string
  client: string
  email: string
  service: string
  date: string
  time: string
  price: number
  depositPaid: boolean
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled"
}

const initialBookings: Booking[] = [
  { id: "001", client: "Jane Smith", email: "jane@example.com", service: "Boho Braids", date: "2026-06-12", time: "10:00", price: 130, depositPaid: true, status: "Confirmed" },
  { id: "002", client: "Amy Jones", email: "amy@example.com", service: "Knotless Braids", date: "2026-06-13", time: "14:00", price: 80, depositPaid: false, status: "Pending" },
  { id: "003", client: "Rose Tyler", email: "rose@example.com", service: "Cornrows", date: "2026-06-14", time: "15:00", price: 20, depositPaid: false, status: "Confirmed" },
  { id: "004", client: "Martha Jones", email: "martha@example.com", service: "Short Boho Braids", date: "2026-06-15", time: "11:00", price: 65, depositPaid: true, status: "Pending" },
  { id: "005", client: "Donna Noble", email: "donna@example.com", service: "Fulani Braids", date: "2026-06-19", time: "09:00", price: 80, depositPaid: true, status: "Confirmed" },
]

const statusStyles: Record<string, string> = {
  Confirmed: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Completed: "bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-700",
}

export default function BookingTable() {
  const [bookings, setBookings] = useState(initialBookings)
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null)
  const [filter, setFilter] = useState<string>("all")

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status.toLowerCase() === filter)
  const [toast, setToast] = useState<string | null>(null)

  const handleCancel = (reason: string) => {
    if (!cancelTarget) return
    setBookings(bookings.map((b) =>
      b.id === cancelTarget.id ? { ...b, status: "Cancelled" as const } : b
    ))
    setToast(`Booking #${cancelTarget.id} cancelled. Reason: ${reason}. Email sent to ${cancelTarget.email}.`)
    setCancelTarget(null)
    setTimeout(() => setToast(null), 5000)
  }

  const handleMarkPaid = (id: string) => {
    setBookings(bookings.map((b) =>
      b.id === id ? { ...b, depositPaid: true, status: "Confirmed" as const } : b
    ))
    setToast(`Booking #${id} deposit confirmed.`)
    setTimeout(() => setToast(null), 5000)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {["all", "pending", "confirmed", "completed", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-accent text-primary"
                  : "border border-border text-muted hover:border-accent/30"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-card text-left text-sm font-medium text-muted">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Deposit</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((booking) => (
              <tr key={booking.id} className="bg-card text-sm">
                <td className="px-4 py-3 font-mono text-xs text-muted">#{booking.id}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-primary">{booking.client}</p>
                  <p className="text-xs text-muted">{booking.email}</p>
                </td>
                <td className="px-4 py-3 text-muted">{booking.service}</td>
                <td className="px-4 py-3 text-muted">{booking.date}</td>
                <td className="px-4 py-3 text-muted">{booking.time}</td>
                <td className="px-4 py-3 font-medium text-primary">£{booking.price}</td>
                <td className="px-4 py-3">
                  {booking.depositPaid ? (
                    <span className="text-xs font-medium text-green-600">Paid</span>
                  ) : (
                    <button
                      onClick={() => handleMarkPaid(booking.id)}
                      className="text-xs font-medium text-accent-dark hover:text-accent"
                    >
                      Mark Paid
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      statusStyles[booking.status]
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {booking.status !== "Cancelled" && booking.status !== "Completed" && (
                    <button
                      onClick={() => setCancelTarget(booking)}
                      className="text-xs font-medium text-red-500 hover:text-red-700"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cancelTarget && (
        <CancelBookingDialog
          bookingId={cancelTarget.id}
          clientName={cancelTarget.client}
          onCancel={handleCancel}
          onClose={() => setCancelTarget(null)}
        />
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-primary px-4 py-3 text-sm text-white shadow-elevated">
          {toast}
        </div>
      )}
    </div>
  )
}
