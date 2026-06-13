"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface DaySchedule {
  id: string
  day: string
  start: string
  end: string
  timeSlots: string[] | null
  isActive: boolean
}

interface BlockedDate {
  id: string
  date: string
  endDate: string | null
  reason: string | null
}

const TIME_OPTIONS = [
  "00:00", "01:00", "02:00", "03:00", "04:00", "05:00",
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
]

export default function AvailabilityEditor() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([])
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [newBlocked, setNewBlocked] = useState({ fromDate: "", toDate: "", reason: "" })
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [editingDay, setEditingDay] = useState<string | null>(null)

  const [editMode, setEditMode] = useState<"range" | "slots">("range")
  const [editStart, setEditStart] = useState("09:00")
  const [editEnd, setEditEnd] = useState("17:00")
  const [editSlots, setEditSlots] = useState<string[]>(["10:00"])

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

  const openEditor = (day: DaySchedule) => {
    setEditingDay(day.id)
    if (day.timeSlots && day.timeSlots.length > 0) {
      setEditMode("slots")
      setEditSlots([...day.timeSlots])
      setEditStart(day.start)
      setEditEnd(day.end)
    } else {
      setEditMode("range")
      setEditStart(day.start)
      setEditEnd(day.end)
      setEditSlots(["10:00"])
    }
  }

  const saveDay = async () => {
    if (!editingDay) return
    setSaving(editingDay)

    try {
      const body: Record<string, unknown> = { id: editingDay }

      if (editMode === "range") {
        body.startTime = editStart
        body.endTime = editEnd
        body.timeSlots = null
      } else {
        const sorted = [...editSlots].filter((s) => s).sort()
        body.timeSlots = sorted
        body.startTime = sorted[0] || "09:00"
        body.endTime = "23:59"
      }

      const res = await fetch("/api/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setSchedule(
          schedule.map((s) =>
            s.id === editingDay
              ? {
                  ...s,
                  start: editMode === "range" ? editStart : body.timeSlots[0] || s.start,
                  end: editMode === "range" ? editEnd : s.end,
                  timeSlots: editMode === "slots" ? body.timeSlots : null,
                }
              : s
          )
        )
        setEditingDay(null)
        showToast("Saved")
      } else {
        showToast("Failed to save")
      }
    } catch {
      showToast("Failed to save")
    } finally {
      setSaving(null)
    }
  }

  const addSlot = () => {
    setEditSlots([...editSlots, "10:00"])
  }

  const removeSlot = (index: number) => {
    setEditSlots(editSlots.filter((_, i) => i !== index))
  }

  const updateSlot = (index: number, value: string) => {
    setEditSlots(editSlots.map((s, i) => (i === index ? value : s)))
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
        <h2 className="font-serif text-2xl font-bold text-primary">
          Weekly Schedule
        </h2>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-primary/50">
          Set your recurring weekly availability and custom time slots per day
        </p>

        <div className="mt-4 space-y-3">
          {schedule.map((day) => (
            <div key={day.id}>
              <div
                className={`flex items-center justify-between rounded-2xl border p-4 transition-all duration-300 ${
                  day.isActive ? "border-primary/10 bg-white/50 shadow-sm" : "border-dashed border-primary/10 bg-white/20"
                }`}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <button
                    onClick={() => toggleDay(day.id, day.isActive)}
                    disabled={toggling === day.id}
                    className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors duration-300 ${
                      day.isActive ? "bg-accent" : "bg-primary/10"
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                        day.isActive ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`text-base font-bold ${day.isActive ? "text-primary" : "text-primary/40"}`}>
                      {day.day}
                    </p>
                    {day.isActive && (
                      <p className="text-[11px] font-medium tracking-wide text-primary/60 truncate mt-0.5">
                        {day.timeSlots
                          ? `Slots: ${day.timeSlots.join(", ")}`
                          : `${day.start} – ${day.end}`}
                      </p>
                    )}
                  </div>
                </div>
                {day.isActive && (
                  <button
                    onClick={() => openEditor(day)}
                    className="shrink-0 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-accent-dark transition-all duration-300 hover:bg-accent hover:text-white active:scale-95 press-effect bg-accent/10"
                  >
                    Edit Times
                  </button>
                )}
              </div>

              <AnimatePresence>
                {editingDay === day.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 rounded-2xl border border-primary/10 bg-primary/5 p-5 space-y-4">
                      <div className="flex items-center gap-2 bg-white/50 p-1 rounded-xl w-fit">
                        <button
                          onClick={() => setEditMode("range")}
                          className={`rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                            editMode === "range"
                              ? "bg-accent text-white shadow-md"
                              : "text-primary/60 hover:text-primary"
                          }`}
                        >
                          Time Range
                        </button>
                        <button
                          onClick={() => setEditMode("slots")}
                          className={`rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                            editMode === "slots"
                              ? "bg-accent text-white shadow-md"
                              : "text-primary/60 hover:text-primary"
                          }`}
                        >
                          Custom Slots
                        </button>
                      </div>

                      {editMode === "range" ? (
                        <div className="flex gap-4 items-end">
                          <div>
                            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-primary/60">From</label>
                            <select
                              value={editStart}
                              onChange={(e) => setEditStart(e.target.value)}
                              className="rounded-xl border border-primary/10 bg-white px-4 py-2.5 text-sm font-medium text-primary focus:border-accent focus:outline-none"
                            >
                              {TIME_OPTIONS.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-primary/60">To</label>
                            <select
                              value={editEnd}
                              onChange={(e) => setEditEnd(e.target.value)}
                              className="rounded-xl border border-primary/10 bg-white px-4 py-2.5 text-sm font-medium text-primary focus:border-accent focus:outline-none"
                            >
                              {TIME_OPTIONS.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {editSlots.map((slot, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <select
                                value={slot}
                                onChange={(e) => updateSlot(index, e.target.value)}
                                className="rounded-xl border border-primary/10 bg-white px-4 py-2.5 text-sm font-medium text-primary focus:border-accent focus:outline-none"
                              >
                                {TIME_OPTIONS.map((t) => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => removeSlot(index)}
                                className="rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95 bg-white border border-primary/10"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={addSlot}
                            className="text-[10px] font-bold uppercase tracking-widest text-accent-dark hover:text-accent transition-all mt-2 inline-block"
                          >
                            + Add time slot
                          </button>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4 border-t border-primary/10">
                        <button
                          onClick={saveDay}
                          disabled={saving === day.id}
                          className="rounded-full bg-accent px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-accent-dark active:scale-95 disabled:opacity-50 shadow-md hover:-translate-y-1 hover:shadow-glow"
                        >
                          {saving === day.id ? "..." : "Save Times"}
                        </button>
                        <button
                          onClick={() => setEditingDay(null)}
                          className="rounded-full border border-primary/10 bg-white px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-primary/70 transition-all hover:text-primary active:scale-95"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-8 mt-8 border-t border-primary/10">
        <h2 className="font-serif text-2xl font-bold text-primary">
          Blocked Dates
        </h2>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-primary/50">
          Add dates when you are unavailable (holidays, personal days)
        </p>

        <div className="mt-6 space-y-4 rounded-3xl border border-primary/10 bg-primary/5 p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-end">
            <div className="col-span-1">
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-primary/60">From</label>
              <input
                type="date"
                value={newBlocked.fromDate}
                onChange={(e) =>
                  setNewBlocked({ ...newBlocked, fromDate: e.target.value })
                }
                className="block w-full rounded-xl border border-primary/10 bg-white px-3 py-2.5 text-sm font-medium text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
              />
            </div>
            <div className="col-span-1">
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-primary/60">To</label>
              <input
                type="date"
                value={newBlocked.toDate}
                onChange={(e) =>
                  setNewBlocked({ ...newBlocked, toDate: e.target.value })
                }
                className="block w-full rounded-xl border border-primary/10 bg-white px-3 py-2.5 text-sm font-medium text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
              />
            </div>
            <button
              onClick={addBlockedDate}
              disabled={adding || !newBlocked.fromDate}
              className="col-span-2 rounded-full bg-primary px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest text-white transition-all duration-200 hover:bg-primary-light active:scale-95 disabled:opacity-50 sm:w-auto sm:self-end shadow-md hover:-translate-y-1 hover:shadow-glow"
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
            className="block w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-sm font-medium text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
          />
        </div>

        {blockedDates.length > 0 && (
          <div className="mt-4 space-y-2">
            {blockedDates.map((blocked) => (
              <div
                key={blocked.id}
                className="flex items-center justify-between rounded-2xl border border-primary/10 bg-white/50 p-5 transition-colors hover:bg-white"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-primary">
                    {blocked.date}
                    {blocked.endDate && blocked.endDate !== blocked.date && (
                      <span> – {blocked.endDate}</span>
                    )}
                  </p>
                  {blocked.reason && (
                    <p className="text-[11px] font-bold uppercase tracking-widest text-primary/50 mt-1">{blocked.reason}</p>
                  )}
                </div>
                <button
                  onClick={() => removeBlockedDate(blocked.id)}
                  className="shrink-0 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-50 transition-all duration-200 hover:bg-red-500 hover:text-white active:scale-95 press-effect"
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
