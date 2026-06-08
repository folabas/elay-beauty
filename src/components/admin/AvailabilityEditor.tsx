"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface DaySchedule {
  id: string
  day: string
  start: string
  end: string
  isActive: boolean
}

interface BlockedDate {
  id: string
  date: string
  endDate: string | null
  reason: string | null
}

export default function AvailabilityEditor() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([])
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [newBlocked, setNewBlocked] = useState({ fromDate: "", toDate: "", reason: "" })
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    async function load() {
      try {
        const [availRes, blockedRes] = await Promise.all([
          fetch("/api/availability"),
          fetch("/api/blocked-slots"),
        ])
        if (availRes.ok) setSchedule(await availRes.json())
        if (blockedRes.ok) setBlockedDates(await blockedRes.json())
      } catch {
        showToast("Failed to load availability")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const toggleDay = async (id: string, current: boolean) => {
    setToggling(id)
    setSchedule(schedule.map((s) => (s.id === id ? { ...s, isActive: !current } : s)))

    try {
      const res = await fetch("/api/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !current }),
      })
      if (!res.ok) {
        setSchedule(schedule.map((s) => (s.id === id ? { ...s, isActive: current } : s)))
        showToast("Failed to update")
      }
    } catch {
      setSchedule(schedule.map((s) => (s.id === id ? { ...s, isActive: current } : s)))
      showToast("Failed to update")
    } finally {
      setToggling(null)
    }
  }

  const addBlockedDate = async () => {
    if (!newBlocked.fromDate) return
    setAdding(true)

    try {
      const res = await fetch("/api/blocked-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBlocked),
      })
      if (res.ok) {
        const created = await res.json()
        setBlockedDates([...blockedDates, created])
        setNewBlocked({ fromDate: "", toDate: "", reason: "" })
        showToast("Date blocked")
      } else {
        showToast("Failed to add blocked date")
      }
    } catch {
      showToast("Failed to add blocked date")
    } finally {
      setAdding(false)
    }
  }

  const removeBlockedDate = async (id: string) => {
    try {
      const res = await fetch(`/api/blocked-slots/${id}`, { method: "DELETE" })
      if (res.ok) {
        setBlockedDates(blockedDates.filter((b) => b.id !== id))
      } else {
        showToast("Failed to remove blocked date")
      }
    } catch {
      showToast("Failed to remove blocked date")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm text-muted">Loading availability...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-xl font-bold text-primary">
          Weekly Schedule
        </h2>
        <p className="mt-1 text-sm text-muted">
          Set your recurring weekly availability
        </p>

        <div className="mt-4 space-y-3">
          {schedule.map((day) => (
            <div
              key={day.id}
              className={`flex items-center justify-between rounded-lg border p-4 transition-all duration-200 ${
                day.isActive ? "border-border bg-card" : "border-dashed border-border bg-card/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleDay(day.id, day.isActive)}
                  disabled={toggling === day.id}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${
                    day.isActive ? "bg-accent" : "bg-border"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      day.isActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <div>
                  <p className={`text-sm font-medium ${day.isActive ? "text-primary" : "text-muted"}`}>
                    {day.day}
                  </p>
                  {day.isActive && (
                    <p className="text-xs text-muted">
                      {day.start} – {day.end}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl font-bold text-primary">
          Blocked Dates
        </h2>
        <p className="mt-1 text-sm text-muted">
          Add dates when you are unavailable (holidays, personal days)
        </p>

        <div className="mt-4 space-y-3 rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted">From date</label>
              <input
                type="date"
                value={newBlocked.fromDate}
                onChange={(e) =>
                  setNewBlocked({ ...newBlocked, fromDate: e.target.value })
                }
                className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-primary focus:border-accent focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted">To date</label>
              <input
                type="date"
                value={newBlocked.toDate}
                onChange={(e) =>
                  setNewBlocked({ ...newBlocked, toDate: e.target.value })
                }
                className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-primary focus:border-accent focus:outline-none"
              />
            </div>
            <button
              onClick={addBlockedDate}
              disabled={adding || !newBlocked.fromDate}
              className="w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-primary-light active:scale-95 disabled:opacity-50 sm:w-auto sm:self-end"
            >
              {adding ? "..." : "Add"}
            </button>
          </div>
          <input
            type="text"
            value={newBlocked.reason}
            onChange={(e) =>
              setNewBlocked({ ...newBlocked, reason: e.target.value })
            }
            placeholder="Reason (optional) – e.g. Holiday, Appointment"
            className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-primary focus:border-accent focus:outline-none"
          />
        </div>

        {blockedDates.length > 0 && (
          <div className="mt-4 space-y-2">
            {blockedDates.map((blocked) => (
              <div
                key={blocked.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-primary">
                    {blocked.date}
                    {blocked.endDate && blocked.endDate !== blocked.date && (
                      <span> – {blocked.endDate}</span>
                    )}
                  </p>
                  {blocked.reason && (
                    <p className="text-xs text-muted">{blocked.reason}</p>
                  )}
                </div>
                <button
                  onClick={() => removeBlockedDate(blocked.id)}
                  className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-red-500 transition-all duration-200 hover:bg-red-50 hover:text-red-700 active:scale-95"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {blockedDates.length === 0 && !loading && (
          <p className="mt-4 text-sm text-muted">No blocked dates</p>
        )}
      </div>

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
