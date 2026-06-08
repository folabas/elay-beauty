"use client"

import { useState, useEffect } from "react"

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
  reason: string | null
}

export default function AvailabilityEditor() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([])
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [newBlocked, setNewBlocked] = useState({ date: "", reason: "" })
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
    if (!newBlocked.date) return
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
        setNewBlocked({ date: "", reason: "" })
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
        <p className="text-sm text-muted">Loading availability...</p>
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
              className={`flex items-center justify-between rounded-lg border p-4 ${
                day.isActive ? "border-border bg-card" : "border-dashed border-border bg-card/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleDay(day.id, day.isActive)}
                  disabled={toggling === day.id}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    day.isActive ? "bg-accent" : "bg-border"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
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

        <div className="mt-4 flex gap-3">
          <input
            type="date"
            value={newBlocked.date}
            onChange={(e) =>
              setNewBlocked({ ...newBlocked, date: e.target.value })
            }
            className="block rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
          />
          <input
            type="text"
            value={newBlocked.reason}
            onChange={(e) =>
              setNewBlocked({ ...newBlocked, reason: e.target.value })
            }
            placeholder="Reason (optional)"
            className="block flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
          />
          <button
            onClick={addBlockedDate}
            disabled={adding || !newBlocked.date}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-50"
          >
            {adding ? "..." : "Add"}
          </button>
        </div>

        {blockedDates.length > 0 && (
          <div className="mt-4 space-y-2">
            {blockedDates.map((blocked) => (
              <div
                key={blocked.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
              >
                <div>
                  <p className="text-sm font-medium text-primary">{blocked.date}</p>
                  {blocked.reason && (
                    <p className="text-xs text-muted">{blocked.reason}</p>
                  )}
                </div>
                <button
                  onClick={() => removeBlockedDate(blocked.id)}
                  className="text-xs font-medium text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {blockedDates.length === 0 && (
          <p className="mt-4 text-sm text-muted">No blocked dates</p>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-primary px-4 py-3 text-sm text-white shadow-elevated">
          {toast}
        </div>
      )}
    </div>
  )
}
