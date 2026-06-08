"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"

interface CancelBookingDialogProps {
  bookingId: string
  clientName: string
  onCancel: (reason: string, alternative?: { date: string; time: string }) => void
  onClose: () => void
}

export default function CancelBookingDialog({
  bookingId,
  clientName,
  onCancel,
  onClose,
}: CancelBookingDialogProps) {
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const [offerAlternative, setOfferAlternative] = useState(false)
  const [altDate, setAltDate] = useState("")
  const [altTime, setAltTime] = useState("")
  const [altSlots, setAltSlots] = useState<{ time: string; available: boolean }[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [onClose])

  useEffect(() => {
    if (!offerAlternative || !altDate) {
      setAltSlots([])
      setAltTime("")
      return
    }

    async function fetchSlots() {
      setLoadingSlots(true)
      try {
        const res = await fetch(`/api/availability/slots?date=${altDate}`)
        if (res.ok) {
          const data = await res.json()
          setAltSlots(data.slots || [])
          if (!data.slots?.some((s: { time: string }) => s.time === altTime)) {
            setAltTime("")
          }
        }
      } catch {
        // ignore
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchSlots()
  }, [altDate, offerAlternative])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError("Please provide a reason for cancellation")
      return
    }
    if (offerAlternative && (!altDate || !altTime)) {
      setError("Please select an alternative date and time")
      return
    }
    onCancel(
      reason,
      offerAlternative ? { date: altDate, time: altTime } : undefined
    )
  }

  const handleKeepAndClose = () => {
    setReason("")
    setError("")
    setOfferAlternative(false)
    setAltDate("")
    setAltTime("")
    setAltSlots([])
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg rounded-xl bg-card p-6 shadow-elevated"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-primary">
            Cancel Booking #{bookingId.slice(0, 8)}
          </h2>
          <button
            onClick={handleKeepAndClose}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-border hover:text-primary active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-2 text-sm text-muted">
          Are you sure you want to cancel the booking for{" "}
          <span className="font-medium text-primary">{clientName}</span>?
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-primary">
              Reason for cancellation
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setError("")
              }}
              className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-primary focus:border-accent focus:outline-none"
              rows={3}
              placeholder="e.g. Client requested cancellation, unavailable on selected date..."
              autoFocus
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={offerAlternative}
              onChange={(e) => setOfferAlternative(e.target.checked)}
              className="mt-0.5 h-5 w-5 rounded border-border text-accent focus:ring-accent"
            />
            <div>
              <span className="text-sm font-medium text-primary">
                Offer an alternative time
              </span>
              <p className="text-xs text-muted">
                Suggest a new date/time in the cancellation email
              </p>
            </div>
          </label>

          {offerAlternative && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-primary">
                    Alternative Date
                  </label>
                  <input
                    type="date"
                    value={altDate}
                    onChange={(e) => setAltDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="mt-1 block w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-primary focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-primary">
                    Alternative Time
                  </label>
                  {loadingSlots ? (
                    <p className="mt-1 text-sm text-muted">Loading available slots...</p>
                  ) : altSlots.length === 0 && altDate ? (
                    <p className="mt-1 text-sm text-muted">No available slots on this date</p>
                  ) : (
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {altSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setAltTime(slot.time)}
                          className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all active:scale-95 ${
                            !slot.available
                              ? "border-border bg-card/50 text-muted-light line-through cursor-not-allowed"
                              : altTime === slot.time
                                ? "border-accent bg-accent text-primary"
                                : "border-border bg-card text-muted hover:border-accent/30"
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-500"
            >
              {error}
            </motion.p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleKeepAndClose}
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted transition-all duration-200 hover:bg-background active:scale-95"
            >
              Keep Booking
            </button>
            <button
              type="submit"
              className="rounded-lg bg-burgundy px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-burgundy-light active:scale-95"
            >
              {offerAlternative ? "Cancel & Offer Time" : "Cancel Booking"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
