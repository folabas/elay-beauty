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
  phone?: string | null
  service: string
  date: string
  time: string
  price: number
  depositPaid: boolean
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled"
  hairLength?: string | null
  hairType?: string | null
  selectedSize?: string | null
  notes?: string | null
  isStudent: boolean
  cancellationReason?: string | null
}

const statusStyles: Record<string, string> = {
  Confirmed: "bg-green-50 text-green-700 border border-green-200",
  Pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  Completed: "bg-blue-50 text-blue-700 border border-blue-200",
  Cancelled: "bg-red-50 text-red-700 border border-red-200",
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
      <div className="flex gap-3 overflow-x-auto">
        {["all", "pending", "confirmed", "completed", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 press-effect ${
              filter === f
                ? "bg-primary text-white shadow-md"
                : "border border-primary/10 text-primary/70 hover:border-primary/30 hover:text-primary hover:bg-black/5"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-primary/10">
        <table className="hidden min-w-[700px] md:table w-full">
          <thead>
            <tr className="bg-primary/5 border-b border-primary/10 text-left text-[11px] font-bold uppercase tracking-widest text-primary/60">
              <th className="px-4 py-3 whitespace-nowrap">ID</th>
              <th className="px-4 py-3 whitespace-nowrap">Client</th>
              <th className="px-4 py-3 whitespace-nowrap">Service</th>
              <th className="px-4 py-3 whitespace-nowrap">Date</th>
              <th className="px-4 py-3 whitespace-nowrap">Time</th>
              <th className="px-4 py-3 whitespace-nowrap">Price</th>
              <th className="px-4 py-3 whitespace-nowrap">Deposit</th>
              <th className="px-4 py-3 whitespace-nowrap">Status</th>
              <th className="px-4 py-3 whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="bg-card py-12 text-center text-sm text-muted">
                  No bookings found
                </td>
              </tr>
            ) : (
              filtered.map((booking) => (
                <tr key={booking.id} className="text-sm transition-colors hover:bg-black/5">
                  <td className="px-4 py-3 font-mono text-[11px] text-primary/50 tracking-wider">#{booking.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-sm text-primary">{booking.client}</p>
                    <p className="text-[11px] text-primary/50 font-medium">{booking.email}</p>
                    {booking.phone && <p className="text-[11px] text-primary/40">{booking.phone}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-primary/80 max-w-[140px] truncate">{booking.service}</td>
                  <td className="px-4 py-3 text-sm font-medium text-primary/80 whitespace-nowrap">{booking.date}</td>
                  <td className="px-4 py-3 text-sm font-medium text-primary/80">{booking.time}</td>
                  <td className="px-4 py-3 font-bold text-primary whitespace-nowrap">
                    £{booking.price}
                    {booking.isStudent && <span className="ml-1.5 inline-flex items-center rounded-full bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent-dark">Student</span>}
                  </td>
                  <td className="px-4 py-3">
                    {booking.depositPaid ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-green-600">
                        <CheckCircle className="h-3 w-3" /> Paid
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkPaid(booking.id)}
                        disabled={processing === booking.id}
                        className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-accent-dark transition-colors hover:text-accent disabled:opacity-50"
                      >
                        {processing === booking.id ? "..." : <><CreditCard className="h-3 w-3" /> Pay</>}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${statusStyles[booking.status]}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusDot[booking.status]}`} />
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {booking.status !== "Cancelled" && booking.status !== "Completed" && (
                        <button
                          onClick={() => setCancelTarget(booking)}
                          disabled={processing === booking.id}
                          className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          title="Cancel booking"
                        >
                          {processing === booking.id ? <span className="text-[10px]">...</span> : <XCircle className="h-4 w-4" />}
                        </button>
                      )}
                      <button
                        onClick={() => setViewing(booking)}
                        className="rounded-lg p-2 text-accent-dark transition-colors hover:bg-accent/10"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
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
            <div className="py-12 text-center text-sm font-medium text-primary/50 uppercase tracking-widest">
              No bookings found
            </div>
          ) : (
            <div className="divide-y divide-primary/5">
              {filtered.map((booking) => (
                <div key={booking.id} className="px-4 py-5 transition-colors hover:bg-black/5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold tracking-wider text-primary/40">#{booking.id.slice(0, 8)}</span>
                      </div>
                      <p className="font-bold text-sm text-primary truncate">{booking.client}</p>
                      <p className="text-[11px] font-medium text-primary/60 truncate">{booking.service}</p>
                      {booking.phone && <p className="text-[10px] text-primary/40">{booking.phone}</p>}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-primary/60 tracking-wider">
                        <span>{booking.date}</span>
                        <span>{booking.time}</span>
                        <span className="font-black text-primary">£{booking.price}</span>
                        {booking.isStudent && <span className="inline-flex items-center rounded-full bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent-dark">Student</span>}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${statusStyles[booking.status]}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusDot[booking.status]}`} />
                        {booking.status}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {!booking.depositPaid && booking.status !== "Cancelled" && booking.status !== "Completed" && (
                          <button
                            onClick={() => handleMarkPaid(booking.id)}
                            disabled={processing === booking.id}
                            className="rounded-lg bg-accent/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-accent-dark transition-all active:scale-95 disabled:opacity-50"
                          >
                            {processing === booking.id ? "..." : "Pay"}
                          </button>
                        )}
                        {booking.status !== "Cancelled" && booking.status !== "Completed" && (
                          <button
                            onClick={() => setCancelTarget(booking)}
                            className="rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-50 active:scale-95"
                            title="Cancel"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setViewing(booking)}
                          className="rounded-lg p-1.5 text-accent-dark transition-colors hover:bg-accent/10 active:scale-95"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
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
