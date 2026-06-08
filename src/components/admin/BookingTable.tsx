"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import CancelBookingDialog from "./CancelBookingDialog"
import BookingDetailsDialog from "./BookingDetailsDialog"
import { CheckCircle, XCircle, Eye, CreditCard, ChevronRight } from "lucide-react"

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
  hairLength?: string | null
  hairType?: string | null
  notes?: string | null
  isStudent: boolean
  cancellationReason?: string | null
}

const statusStyles: Record<string, string> = {
  Confirmed: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Completed: "bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-700",
}

const statusDot: Record<string, string> = {
  Confirmed: "bg-green-500",
  Pending: "bg-yellow-500",
  Completed: "bg-blue-500",
  Cancelled: "bg-red-500",
}

export default function BookingTable({ bookings: initial }: { bookings: BookingRow[] }) {
  const [bookings, setBookings] = useState(initial)
  const [cancelTarget, setCancelTarget] = useState<BookingRow | null>(null)
  const [viewing, setViewing] = useState<BookingRow | null>(null)
  const [filter, setFilter] = useState<string>("all")
  const [processing, setProcessing] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status.toLowerCase() === filter)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 5000)
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCancelTarget(null)
        setViewing(null)
      }
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [])

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

      const data = await res.json()
      setBookings(bookings.map((b) =>
        b.id === cancelTarget.id ? { ...b, status: "Cancelled" as const } : b
      ))
      const altMsg = alternative
        ? ` Alternative offered: ${alternative.date} at ${alternative.time}.`
        : ""
      const emailMsg = data.emailWarning ? ` ${data.emailWarning}` : ""
      showToast(`Booking #${cancelTarget.id.slice(0, 8)} cancelled.${altMsg}${emailMsg}`)
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

      const data = await res.json()
      setBookings(bookings.map((b) =>
        b.id === id ? { ...b, depositPaid: true, status: "Confirmed" as const } : b
      ))
      const emailMsg = data.emailWarning ? ` ${data.emailWarning}` : ""
      showToast(`Booking #${id.slice(0, 8)} deposit confirmed.${emailMsg}`)
    } catch (err) {
      showToast(`Error: ${err instanceof Error ? err.message : "Failed to mark paid"}`)
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {["all", "pending", "confirmed", "completed", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all duration-200 active:scale-95 ${
              filter === f
                ? "bg-accent text-primary shadow-sm"
                : "border border-border text-muted hover:border-accent/30 hover:text-primary"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="hidden min-w-[700px] md:table w-full">
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
                <tr key={booking.id} className="bg-card text-sm transition-colors hover:bg-accent/5">
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
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                        <CheckCircle className="h-3 w-3" /> Paid
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkPaid(booking.id)}
                        disabled={processing === booking.id}
                        className="inline-flex items-center gap-1 text-xs font-medium text-accent-dark transition-colors hover:text-accent disabled:opacity-50"
                      >
                        {processing === booking.id ? "..." : <><CreditCard className="h-3 w-3" /> Mark Paid</>}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[booking.status]}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusDot[booking.status]}`} />
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {booking.status !== "Cancelled" && booking.status !== "Completed" && (
                        <button
                          onClick={() => setCancelTarget(booking)}
                          disabled={processing === booking.id}
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                        >
                          {processing === booking.id ? "..." : <><XCircle className="h-3 w-3" /> Cancel</>}
                        </button>
                      )}
                      <button
                        onClick={() => setViewing(booking)}
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-accent-dark transition-colors hover:bg-accent/10 hover:text-accent"
                      >
                        <Eye className="h-3 w-3" /> View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="block md:hidden">
          {filtered.length === 0 ? (
            <div className="bg-card py-12 text-center text-sm text-muted">
              No bookings found
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((booking) => (
                <div key={booking.id} className="bg-card px-4 py-4 transition-colors hover:bg-accent/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted">#{booking.id.slice(0, 8)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-primary truncate">{booking.client}</p>
                        <p className="text-xs text-muted truncate">{booking.service}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted">
                        <span>{booking.date}</span>
                        <span>{booking.time}</span>
                        <span className="font-semibold text-primary">£{booking.price}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusStyles[booking.status]}`}>
                        <span className={`h-2 w-2 rounded-full ${statusDot[booking.status]}`} />
                        {booking.status}
                      </span>
                      <div className="flex items-center gap-2">
                        {!booking.depositPaid && booking.status !== "Cancelled" && booking.status !== "Completed" && (
                          <button
                            onClick={() => handleMarkPaid(booking.id)}
                            disabled={processing === booking.id}
                            className="rounded-lg bg-accent/10 px-3 py-2 text-xs font-medium text-accent-dark transition-all active:scale-95 disabled:opacity-50"
                          >
                            {processing === booking.id ? "..." : "Mark Paid"}
                          </button>
                        )}
                        {booking.status !== "Cancelled" && booking.status !== "Completed" && (
                          <button
                            onClick={() => setCancelTarget(booking)}
                            className="rounded-lg px-3 py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 active:scale-95"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => setViewing(booking)}
                          className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-accent-dark transition-colors hover:bg-accent/10 active:scale-95"
                        >
                          View <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {cancelTarget && (
          <CancelBookingDialog
            bookingId={cancelTarget.id}
            clientName={cancelTarget.client}
            onCancel={handleCancel}
            onClose={() => setCancelTarget(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewing && (
          <BookingDetailsDialog
            booking={viewing}
            onClose={() => setViewing(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-lg bg-primary px-4 py-3 text-center text-sm text-white shadow-elevated md:left-auto md:right-4 md:max-w-md md:text-left"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
