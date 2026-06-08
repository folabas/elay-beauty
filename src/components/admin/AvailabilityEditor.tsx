"use client"

import { useState } from "react"
import { AVAILABILITY_SCHEDULE } from "@/types"

interface DaySchedule {
  day: string
  start: string
  end: string
  isActive: boolean
}

export default function AvailabilityEditor() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    AVAILABILITY_SCHEDULE.map((s) => ({ ...s, isActive: true }))
  )
  const [blockedDates, setBlockedDates] = useState<
    { date: string; reason: string }[]
  >([])
  const [newBlocked, setNewBlocked] = useState({ date: "", reason: "" })

  const toggleDay = (day: string) => {
    setSchedule(
      schedule.map((s) => (s.day === day ? { ...s, isActive: !s.isActive } : s))
    )
  }

  const addBlockedDate = () => {
    if (!newBlocked.date) return
    setBlockedDates([...blockedDates, newBlocked])
    setNewBlocked({ date: "", reason: "" })
  }

  const removeBlockedDate = (date: string) => {
    setBlockedDates(blockedDates.filter((b) => b.date !== date))
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
              key={day.day}
              className={`flex items-center justify-between rounded-lg border p-4 ${
                day.isActive ? "border-border bg-card" : "border-dashed border-border bg-card/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleDay(day.day)}
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
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light"
          >
            Add
          </button>
        </div>

        {blockedDates.length > 0 && (
          <div className="mt-4 space-y-2">
            {blockedDates.map((blocked) => (
              <div
                key={blocked.date}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
              >
                <div>
                  <p className="text-sm font-medium text-primary">{blocked.date}</p>
                  {blocked.reason && (
                    <p className="text-xs text-muted">{blocked.reason}</p>
                  )}
                </div>
                <button
                  onClick={() => removeBlockedDate(blocked.date)}
                  className="text-xs font-medium text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
