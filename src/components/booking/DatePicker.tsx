"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Weeks start on Monday.
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

type DayStatus = "open" | "booked" | "closed"

interface DatePickerProps {
  selectedDate: string
  onSelectDate: (date: string) => void
}

function toDateString(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export default function DatePicker({ selectedDate, onSelectDate }: DatePickerProps) {
  const [statuses, setStatuses] = useState<Record<string, DayStatus>>({})
  const [loadedKey, setLoadedKey] = useState<string | null>(null)
  const [failedKey, setFailedKey] = useState<string | null>(null)
  const [reloadCount, setReloadCount] = useState(0)
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth())
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear())

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  // Number of blank cells before the 1st, with Monday as the first column.
  const leadingBlanks = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7
  const requestKey = `${viewYear}-${viewMonth}-${reloadCount}`
  const loading = loadedKey !== requestKey && failedKey !== requestKey
  const failed = failedKey === requestKey

  // Re-check availability when the visitor comes back to the tab, so a page left
  // open never shows dates the salon has since opened or closed.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") setReloadCount((c) => c + 1)
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [])

  useEffect(() => {
    let cancelled = false
    const key = `${viewYear}-${viewMonth}-${reloadCount}`
    const from = toDateString(viewYear, viewMonth, 1)
    const to = toDateString(viewYear, viewMonth, daysInMonth)

    fetch(`/api/availability/calendar?from=${from}&to=${to}`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: { date: string; status: DayStatus }[]) => {
        if (cancelled) return
        setStatuses((prev) => {
          const next = { ...prev }
          for (const d of data) next[d.date] = d.status
          return next
        })
        setLoadedKey(key)
      })
      .catch(() => {
        // Don't show a failed load as "everything closed".
        if (!cancelled) setFailedKey(key)
      })

    return () => {
      cancelled = true
    }
  }, [viewYear, viewMonth, daysInMonth, reloadCount])

  const now = new Date()
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth()

  const prevMonth = () => {
    if (isCurrentMonth) return
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          disabled={isCurrentMonth}
          aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-accent/10 hover:text-accent transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-serif text-lg font-semibold text-primary">
          {monthLabel}
        </span>
        <button
          onClick={nextMonth}
          aria-label="Next month"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-accent/10 hover:text-accent transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className={`mt-4 grid grid-cols-7 gap-1 transition-opacity ${loading ? "opacity-50" : ""}`}>
        {DAY_NAMES.map((name) => (
          <div key={name} className="py-1 text-center text-xs font-semibold uppercase tracking-wider text-muted">
            {name}
          </div>
        ))}
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dateStr = toDateString(viewYear, viewMonth, day)
          const status = statuses[dateStr] ?? "closed"
          const available = status === "open"
          const isSelected = dateStr === selectedDate

          return (
            <button
              key={day}
              onClick={() => available && onSelectDate(dateStr)}
              disabled={!available}
              title={status === "booked" ? "Fully booked" : undefined}
              className={`flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-all ${
                status === "booked"
                  ? "cursor-not-allowed text-muted-light/60 line-through"
                  : !available
                    ? "cursor-not-allowed text-muted-light/40"
                    : isSelected
                      ? "bg-accent text-primary font-semibold"
                      : "text-primary hover:bg-accent/10"
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>

      {failed && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          <span>Couldn&apos;t load available dates.</span>
          <button onClick={() => setReloadCount((c) => c + 1)} className="font-semibold underline">
            Try again
          </button>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-3 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="line-through">12</span> Fully booked
        </span>
        <span>We work Saturdays &amp; Sundays</span>
      </div>
    </div>
  )
}
