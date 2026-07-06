"use client"

import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { Calendar01Icon, Link01Icon, Unlink01Icon, Refresh01Icon, CheckmarkCircle01Icon, Alert01Icon } from "hugeicons-react"
import { useEffect, useState, Suspense } from "react"

function SettingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [connected, setConnected] = useState<boolean | null>(null)
  const [calendarEmail, setCalendarEmail] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)

  const success = searchParams.get("success")
  const error = searchParams.get("error")

  useEffect(() => {
    fetch("/api/auth/google-calendar/status")
      .then((r) => r.json())
      .then((data) => { setConnected(data.connected); setCalendarEmail(data.email) })
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

  const handleReconnect = async () => {
    setReconnecting(true)
    try {
      await fetch("/api/auth/google-calendar/disconnect", { method: "POST" })
    } catch {
      // ignore
    }
    window.location.href = "/api/auth/google-calendar"
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6 lg:p-10 pb-32">
      <div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-primary">
          Settings<span className="text-accent">.</span>
        </h1>
        <p className="mt-2 text-sm font-bold tracking-widest uppercase text-primary/50">Manage your admin account and integrations</p>
      </div>

      {success === "connected" && (
        <div className="flex flex-col sm:flex-row items-start gap-3 rounded-3xl border border-green-200 bg-green-50 p-5 sm:p-6 shadow-sm">
          <CheckmarkCircle01Icon className="h-6 w-6 shrink-0 text-green-600" />
          <span className="flex-1 text-sm font-medium text-green-800 leading-relaxed">
            Google Calendar connected successfully! New confirmed bookings will automatically appear on your calendar.
          </span>
          <button onClick={() => router.replace("/admin/settings")} className="w-full sm:w-auto shrink-0 rounded-full px-4 py-3 sm:py-2 text-[10px] font-bold uppercase tracking-widest text-green-700 underline transition-colors hover:bg-green-100">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="flex flex-col sm:flex-row items-start gap-3 rounded-3xl border border-red-200 bg-red-50 p-5 sm:p-6 shadow-sm">
          <Alert01Icon className="h-6 w-6 shrink-0 text-red-600" />
          <span className="flex-1 text-sm font-medium text-red-800 leading-relaxed">
            {error === "access_denied"
              ? "You denied the Google Calendar authorization request."
              : "Failed to connect Google Calendar. Please try again."}
          </span>
          <button onClick={() => router.replace("/admin/settings")} className="w-full sm:w-auto shrink-0 rounded-full px-4 py-3 sm:py-2 text-[10px] font-bold uppercase tracking-widest text-red-700 underline transition-colors hover:bg-red-100">
            Dismiss
          </button>
        </div>
      )}

      <div className="glass-card rounded-[32px] border border-primary/10 p-6 sm:p-8 shadow-elevated overflow-x-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-accent/10 shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Calendar01Icon className="size-[22px] sm:size-[28px] text-accent" variant="stroke" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-primary mb-1">Google Calendar</h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary/50">
              Automatically create calendar events when bookings are confirmed
            </p>
          </div>

          {connected === null ? (
            <div className="h-6 w-6 animate-pulse rounded-full bg-primary/10" />
          ) : connected ? (
            <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] font-bold uppercase tracking-widest text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Connected
                </span>
                {calendarEmail && (
                  <span className="text-[11px] font-medium text-primary/50 truncate max-w-[200px]">
                    {calendarEmail}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReconnect}
                  disabled={reconnecting}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-primary/10 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-primary/70 transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 active:scale-95 disabled:opacity-50 press-effect shadow-sm"
                >
                  <Refresh01Icon size={13} />
                  {reconnecting ? "Reconnecting..." : "Reconnect"}
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-primary/10 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-primary/70 transition-all duration-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-95 disabled:opacity-50 press-effect shadow-sm"
                >
                  <Unlink01Icon size={13} />
                  {disconnecting ? "Disconnecting..." : "Disconnect"}
                </button>
              </div>
            </div>
          ) : (
            <a
              href="/api/auth/google-calendar"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-primary-light active:scale-95 shadow-md hover:-translate-y-1 hover:shadow-glow press-effect"
            >
              <Link01Icon size={15} />
              Connect
            </a>
          )}
        </div>

        {connected && (
          <div className="mt-8 border-t border-primary/10 pt-8">
            <h3 className="mb-4 font-serif text-lg font-bold text-primary">What happens next?</h3>
            <ul className="space-y-4 text-sm font-medium text-primary/70">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                <span>When you mark a booking as <strong className="text-primary font-bold">deposit paid (confirmed)</strong>, a calendar event will be created automatically.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                <span>If you cancel a booking, the calendar event will be removed.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                <span>You will receive a <strong className="text-primary font-bold">popup + email reminder</strong> 30 minutes before each appointment.</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6"><div className="h-5 w-5 animate-pulse rounded-full bg-muted" /></div>}>
      <SettingsContent />
    </Suspense>
  )
}
