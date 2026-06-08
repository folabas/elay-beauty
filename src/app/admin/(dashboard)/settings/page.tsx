"use client"

import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { Calendar, Link2, Link2Off, CheckCircle, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [connected, setConnected] = useState<boolean | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)

  const success = searchParams.get("success")
  const error = searchParams.get("error")

  useEffect(() => {
    fetch("/api/auth/google-calendar/status")
      .then((r) => r.json())
      .then((data) => setConnected(data.connected))
      .catch(() => setConnected(false))
  }, [])

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      await fetch("/api/auth/google-calendar/disconnect", { method: "POST" })
      setConnected(false)
      router.replace("/admin/settings")
    } catch {
      alert("Failed to disconnect")
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-primary">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your admin account and integrations</p>
      </div>

      {success === "connected" && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
          <span>Google Calendar connected successfully! New confirmed bookings will automatically appear on your calendar.</span>
          <button onClick={() => router.replace("/admin/settings")} className="ml-auto text-green-700 underline">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <span>
            {error === "access_denied"
              ? "You denied the Google Calendar authorization request."
              : "Failed to connect Google Calendar. Please try again."}
          </span>
          <button onClick={() => router.replace("/admin/settings")} className="ml-auto text-red-700 underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
            <Calendar className="h-6 w-6 text-accent-dark" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-primary">Google Calendar</h2>
            <p className="text-sm text-muted">
              Automatically create calendar events when bookings are confirmed
            </p>
          </div>

          {connected === null ? (
            <div className="h-5 w-5 animate-pulse rounded-full bg-muted" />
          ) : connected ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Connected
              </span>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <Link2Off className="h-4 w-4" />
                {disconnecting ? "Disconnecting..." : "Disconnect"}
              </button>
            </div>
          ) : (
            <a
              href="/api/auth/google-calendar"
              className="flex items-center gap-1.5 rounded-lg bg-accent-dark px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark/90"
            >
              <Link2 className="h-4 w-4" />
              Connect
            </a>
          )}
        </div>

        {connected && (
          <div className="mt-4 border-t border-border pt-4">
            <h3 className="mb-2 text-sm font-medium text-primary">What happens next?</h3>
            <ul className="space-y-1.5 text-sm text-muted">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-accent-dark" />
                When you mark a booking as <strong className="text-primary">deposit paid (confirmed)</strong>, a calendar event will be created automatically
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-accent-dark" />
                If you cancel a booking, the calendar event will be removed
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-accent-dark" />
                You will receive a <strong className="text-primary">popup + email reminder</strong> 30 minutes before each appointment
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
