"use client"

import { X } from "lucide-react"

interface BookingDetails {
  id: string
  client: string
  email: string
  service: string
  hairLength?: string | null
  hairType?: string | null
  notes?: string | null
  isStudent: boolean
  date: string
  time: string
  price: number
  depositPaid: boolean
  status: string
  cancellationReason?: string | null
}

interface BookingDetailsDialogProps {
  booking: BookingDetails
  onClose: () => void
}

const statusStyles: Record<string, string> = {
  Confirmed: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Completed: "bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-700",
}

export default function BookingDetailsDialog({ booking, onClose }: BookingDetailsDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-lg rounded-xl bg-card p-6 shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-primary">Booking Details</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-border hover:text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-lg bg-background p-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-muted">Booking ID</span>
                <p className="mt-0.5 font-mono text-xs text-primary">{booking.id}</p>
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-muted">Status</span>
                <p className="mt-0.5">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      statusStyles[booking.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-medium uppercase tracking-wider text-muted">Client</span>
                <p className="mt-0.5 font-medium text-primary">{booking.client}</p>
                <p className="text-xs text-muted">{booking.email}</p>
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-muted">Service</span>
                <p className="mt-0.5 text-primary">{booking.service}</p>
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-muted">Price</span>
                <p className="mt-0.5 font-medium text-primary">£{booking.price}</p>
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-muted">Date</span>
                <p className="mt-0.5 text-primary">{booking.date}</p>
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-muted">Time</span>
                <p className="mt-0.5 text-primary">{booking.time}</p>
              </div>
              {booking.hairLength && (
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-muted">Hair Length</span>
                  <p className="mt-0.5 text-primary">{booking.hairLength}</p>
                </div>
              )}
              {booking.hairType && (
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-muted">Hair Type</span>
                  <p className="mt-0.5 capitalize text-primary">{booking.hairType}</p>
                </div>
              )}
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-muted">Deposit</span>
                <p className={`mt-0.5 font-medium ${booking.depositPaid ? "text-green-600" : "text-red-500"}`}>
                  {booking.depositPaid ? "Paid" : "Not Paid"}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-muted">Student Discount</span>
                <p className="mt-0.5 text-primary">{booking.isStudent ? "Yes (20% off)" : "No"}</p>
              </div>
            </div>
          </div>

          {booking.notes && (
            <div className="rounded-lg bg-background p-4">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">Notes</span>
              <p className="mt-1 text-sm text-primary">{booking.notes}</p>
            </div>
          )}

          {booking.cancellationReason && (
            <div className="rounded-lg bg-red-50 p-4">
              <span className="text-xs font-medium uppercase tracking-wider text-red-600">Cancellation Reason</span>
              <p className="mt-1 text-sm text-red-700">{booking.cancellationReason}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-background"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
