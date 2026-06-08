"use client"

import { useState } from "react"
import { X } from "lucide-react"

interface CancelBookingDialogProps {
  bookingId: string
  clientName: string
  onCancel: (reason: string) => void
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError("Please provide a reason for cancellation")
      return
    }
    onCancel(reason)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-md rounded-xl bg-card p-6 shadow-elevated">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-primary">
            Cancel Booking #{bookingId}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted hover:bg-border hover:text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-2 text-sm text-muted">
          Are you sure you want to cancel the booking for{" "}
          <span className="font-medium text-primary">{clientName}</span>?
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <label className="text-sm font-medium text-primary">
            Reason for cancellation
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              setError("")
            }}
            className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
            rows={3}
            placeholder="e.g. Client requested cancellation, unavailable on selected date..."
            autoFocus
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

          <p className="mt-3 text-xs text-muted">
            The client will be notified via email with this reason.
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-background"
            >
              Keep Booking
            </button>
            <button
              type="submit"
              className="rounded-lg bg-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-burgundy-light"
            >
              Cancel Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
