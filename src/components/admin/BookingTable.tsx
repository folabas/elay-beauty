"use client"

import { useState } from "react"
import CancelBookingDialog from "./CancelBookingDialog"

interface BookingRow {
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

const statusStyles: Record<string, string> = {
  Confirmed: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Completed: "bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-700",
}

export default function BookingTable({ bookings: initial }: { bookings: BookingRow[] }) {
  const [bookings, setBookings] = useState(initial)
  const [cancelTarget, setCancelTarget] = useState<BookingRow | null>(null)
  const [filter, setFilter] = useState<string>("all")
  const [processing, setProcessing] = useState<string | null>(null)

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status.toLowerCase() === filter)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 5000)
  }

  const handleCancel = async (reason: string, alternative?: { date: string; time: string }) => {
    if (!cancelTarget) return
    setProcessing(cancelTarget.id)

    try {
      const res = await fetch(`/api/bookings/${cancelTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", reason, alternative }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to cancel")
      }

      setBookings(bookings.map((b) =>
        b.id === cancelTarget.id ? { ...b, status: "Cancelled" as const } : b
      ))
      const altMsg = alternative
        ? ` Alternative offered: ${alternative.date} at ${alternative.time}.`
        : ""
      showToast(`Booking #${cancelTarget.id.slice(0, 8)} cancelled. Email sent to ${cancelTarget.email}.${altMsg}`)
    } catch (err) {
      showToast(`Error: ${err instanceof Error ? err.message : "Failed to cancel"}`)
    } finally {
      setProcessing(null)
      setCancelTarget(null)
    }
  }

  const handleMarkPaid = async (id: string) => {
    setProcessing(id)

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-paid" }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to mark paid")
      }

      setBookings(bookings.map((b) =>
        b.id === id ? { ...b, depositPaid: true, status: "Confirmed" as const } : b
      ))
      showToast(`Booking #${id.slice(0, 8)} deposit confirmed. Confirmation email sent.`)
    } catch (err) {
      showToast(`Error: ${err instanceof Error ? err.message : "Failed to mark paid"}`)
    } finally {
      setProcessing(null)
    }
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="bg-card py-12 text-center text-sm text-muted">
                  No bookings found
                </td>
              </tr>
            ) : (
              filtered.map((booking) => (
                <tr key={booking.id} className="bg-card text-sm">
                  <td className="px-4 py-3 font-mono text-xs text-muted">#{booking.id.slice(0, 8)}</td>
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
                        disabled={processing === booking.id}
                        className="text-xs font-medium text-accent-dark hover:text-accent disabled:opacity-50"
                      >
                        {processing === booking.id ? "..." : "Mark Paid"}
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
                        disabled={processing === booking.id}
                        className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        {processing === booking.id ? "..." : "Cancel"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
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
