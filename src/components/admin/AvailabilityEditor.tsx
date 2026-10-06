"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface DaySchedule {
  id: string
  day: string
  start: string
  end: string
  timeSlots: string[] | null
  isActive: boolean
}

interface DateStatus {
  date: string
  dayOfWeek: number
  isPast: boolean
  open: boolean
  start: string | null
  end: string | null
  timeSlots: string[] | null
  source: "weekly" | "override" | "blocked" | "none"
  overrideId: string | null
  blockedReason: string | null
  booked: boolean
}

interface BlockedDate {
  id: string
  date: string
  endDate: string | null
  reason: string | null
}

interface Times {
  start: string
  end: string
  timeSlots: string[] | null
}

const TIME_OPTIONS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`)
const WEEKS_PER_PAGE = 8

function localDateString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function addDays(date: string, days: number) {
  const d = new Date(date + "T00:00:00")
  d.setDate(d.getDate() + days)
  return localDateString(d)
}

function formatDate(date: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-GB", opts)
}

function describeTimes(t: { start: string | null; end: string | null; timeSlots: string[] | null }) {
  if (t.timeSlots && t.timeSlots.length > 0) return `Slots: ${t.timeSlots.join(", ")}`
  if (t.start && t.end) return `${t.start} – ${t.end}`
  return ""
}

function Toggle({ on, disabled, onClick, label }: { on: boolean; disabled?: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors duration-300 disabled:opacity-40 ${
        on ? "bg-accent" : "bg-primary/10"
      }`}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
          on ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  )
}

function TimeEditor({
  initial,
  saving,
  onSave,
  onCancel,
}: {
  initial: Times
  saving: boolean
  onSave: (times: Times) => void
  onCancel: () => void
}) {
  const [mode, setMode] = useState<"range" | "slots">(initial.timeSlots?.length ? "slots" : "range")
  const [start, setStart] = useState(initial.start)
  const [end, setEnd] = useState(initial.end)
  const [slots, setSlots] = useState<string[]>(initial.timeSlots?.length ? [...initial.timeSlots] : ["10:00"])
  const [error, setError] = useState<string | null>(null)

  const save = () => {
    if (mode === "range") {
      if (end <= start) {
        setError("The end time must be after the start time")
        return
      }
      onSave({ start, end, timeSlots: null })
    } else {
      const sorted = [...new Set(slots.filter(Boolean))].sort()
      if (sorted.length === 0) {
        setError("Add at least one time slot")
        return
      }
      onSave({ start: sorted[0], end: "23:59", timeSlots: sorted })
    }
  }

  const selectClass =
    "rounded-xl border border-primary/10 bg-white px-4 py-2.5 text-sm font-medium text-primary focus:border-accent focus:outline-none"

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="mt-2 rounded-2xl border border-primary/10 bg-primary/5 p-5 space-y-4">
        <div className="flex items-center gap-2 bg-white/50 p-1 rounded-xl w-fit">
          {(["range", "slots"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null) }}
              className={`rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                mode === m ? "bg-accent text-white shadow-md" : "text-primary/60 hover:text-primary"
              }`}
            >
              {m === "range" ? "Time Range" : "Custom Slots"}
            </button>
          ))}
        </div>

        {mode === "range" ? (
          <div className="flex gap-4 items-end">
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-primary/60">From</label>
              <select value={start} onChange={(e) => { setStart(e.target.value); setError(null) }} className={selectClass}>
                {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-primary/60">To</label>
              <select value={end} onChange={(e) => { setEnd(e.target.value); setError(null) }} className={selectClass}>
                {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {slots.map((slot, index) => (
              <div key={index} className="flex items-center gap-3">
                <select
                  value={slot}
                  onChange={(e) => setSlots(slots.map((s, i) => (i === index ? e.target.value : s)))}
                  className={selectClass}
                >
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <button
                  onClick={() => setSlots(slots.filter((_, i) => i !== index))}
                  className="rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95 bg-white border border-primary/10"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => setSlots([...slots, "10:00"])}
              className="text-[10px] font-bold uppercase tracking-widest text-accent-dark hover:text-accent transition-all mt-2 inline-block"
            >
              + Add time slot
            </button>
          </div>
        )}

        {error && <p className="text-xs font-medium text-red-500">{error}</p>}

        <div className="flex gap-3 pt-4 border-t border-primary/10">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-full bg-accent px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-accent-dark active:scale-95 disabled:opacity-50 shadow-md"
          >
            {saving ? "..." : "Save Times"}
          </button>
          <button
            onClick={onCancel}
            className="rounded-full border border-primary/10 bg-white px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-primary/70 transition-all hover:text-primary active:scale-95"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function AvailabilityEditor() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([])
  const [dates, setDates] = useState<DateStatus[]>([])
  const [weeksShown, setWeeksShown] = useState(WEEKS_PER_PAGE)
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [newBlocked, setNewBlocked] = useState({ fromDate: "", toDate: "", reason: "" })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)

  const today = localDateString(new Date())
  const [bulk, setBulk] = useState({ saturday: true, sunday: true, from: "", to: "" })

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const loadDates = useCallback(async (weeks: number) => {
    const res = await fetch(`/api/availability/dates?from=${today}&to=${addDays(today, weeks * 7 - 1)}`)
    if (res.ok) setDates(await res.json())
  }, [today])

  useEffect(() => {
    async function load() {
      try {
        const [availRes, blockedRes] = await Promise.all([
          fetch("/api/availability"),
          fetch("/api/blocked-slots"),
          loadDates(WEEKS_PER_PAGE),
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
  }, [loadDates])

  const refreshDates = () => loadDates(weeksShown).catch(() => {})

  // ── Weekly defaults ────────────────────────────────────────────────

  const updateWeekly = async (day: DaySchedule, patch: Record<string, unknown>, successMsg: string) => {
    setBusy(day.id)
    try {
      const res = await fetch("/api/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: day.id, ...patch }),
      })
      if (!res.ok) throw new Error()
      const availRes = await fetch("/api/availability")
      if (availRes.ok) setSchedule(await availRes.json())
      await refreshDates()
      setEditing(null)
      showToast(successMsg)
    } catch {
      showToast("Failed to save")
    } finally {
      setBusy(null)
    }
  }

  const toggleWeekly = (day: DaySchedule) => {
    if (
      day.isActive &&
      !confirm(
        `Turn off ALL ${day.day}s?\n\nTo close just one ${day.day} (or a few), use "Upcoming weekends" or "Close or open several dates" below instead.`
      )
    ) {
      return
    }
    updateWeekly(day, { isActive: !day.isActive }, day.isActive ? `${day.day}s turned off` : `${day.day}s turned on`)
  }

  // ── Specific dates ─────────────────────────────────────────────────

  const updateDates = async (
    method: "PUT" | "DELETE",
    targetDates: string[],
    patch: Record<string, unknown>,
    key: string,
    successMsg: string
  ) => {
    setBusy(key)
    try {
      const res = await fetch("/api/availability/dates", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: targetDates, ...patch }),
      })
      if (!res.ok) throw new Error()
      await refreshDates()
      setEditing(null)
      showToast(successMsg)
    } catch {
      showToast("Failed to save")
    } finally {
      setBusy(null)
    }
  }

  const showMoreWeeks = async () => {
    const next = weeksShown + WEEKS_PER_PAGE
    setBusy("more")
    try {
      await loadDates(next)
      setWeeksShown(next)
    } finally {
      setBusy(null)
    }
  }

  const bulkDates = () => {
    if (!bulk.from || !bulk.to || bulk.to < bulk.from) return []
    const result: string[] = []
    for (let d = bulk.from; d <= bulk.to && result.length < 400; d = addDays(d, 1)) {
      const dow = new Date(d + "T00:00:00").getDay()
      if ((dow === 6 && bulk.saturday) || (dow === 0 && bulk.sunday)) result.push(d)
    }
    return result
  }
  const selectedBulkDates = bulkDates()

  const runBulk = (action: "close" | "open" | "reset") => {
    if (selectedBulkDates.length === 0) return
    const n = selectedBulkDates.length
    const label = `${n} date${n === 1 ? "" : "s"}`
    if (action === "reset") {
      updateDates("DELETE", selectedBulkDates, {}, "bulk", `${label} reset to weekly schedule`)
    } else {
      updateDates("PUT", selectedBulkDates, { isActive: action === "open" }, "bulk", `${label} ${action === "open" ? "opened" : "closed"}`)
    }
  }

  // ── Blocked dates ──────────────────────────────────────────────────

  const addBlockedDate = async () => {
    if (!newBlocked.fromDate) return
    if (newBlocked.toDate && newBlocked.toDate < newBlocked.fromDate) {
      showToast("'To' date must be after 'From' date")
      return
    }
    setBusy("blocked")
    try {
      const res = await fetch("/api/blocked-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBlocked),
      })
      if (!res.ok) throw new Error()
      const created = await res.json()
      setBlockedDates([...blockedDates, created].sort((a, b) => a.date.localeCompare(b.date)))
      setNewBlocked({ fromDate: "", toDate: "", reason: "" })
      await refreshDates()
      showToast("Dates blocked")
    } catch {
      showToast("Failed to add blocked date")
    } finally {
      setBusy(null)
    }
  }

  const removeBlockedDate = async (id: string) => {
    try {
      const res = await fetch(`/api/blocked-slots/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setBlockedDates(blockedDates.filter((b) => b.id !== id))
      await refreshDates()
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

  // Group upcoming dates into weekends (Saturday + following Sunday).
  const weekends: DateStatus[][] = []
  for (const d of dates) {
    const last = weekends[weekends.length - 1]
    if (d.dayOfWeek === 0 && last && last.length === 1 && last[0].dayOfWeek === 6) last.push(d)
    else weekends.push([d])
  }

  const sectionTitle = "font-serif text-2xl font-bold text-primary"
  const sectionHint = "mt-1 text-[11px] font-bold uppercase tracking-widest text-primary/50"
  const inputClass =
    "block w-full rounded-xl border border-primary/10 bg-white px-3 py-2.5 text-sm font-medium text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
  const labelClass = "mb-2 block text-[10px] font-bold uppercase tracking-widest text-primary/60"

  return (
    <div className="space-y-8">
      {/* Weekly defaults */}
      <div>
        <h2 className={sectionTitle}>Weekly Schedule</h2>
        <p className={sectionHint}>Your normal weekend hours. Every Saturday / Sunday follows these unless you change a specific date below.</p>

        <div className="mt-4 space-y-3">
          {schedule.map((day) => (
            <div key={day.id}>
              <div
                className={`flex items-center justify-between rounded-2xl border p-4 transition-all duration-300 ${
                  day.isActive ? "border-primary/10 bg-white/50 shadow-sm" : "border-dashed border-primary/10 bg-white/20"
                }`}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <Toggle on={day.isActive} disabled={busy === day.id} onClick={() => toggleWeekly(day)} label={`Every ${day.day}`} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-base font-bold ${day.isActive ? "text-primary" : "text-primary/40"}`}>Every {day.day}</p>
                    <p className="text-[11px] font-medium tracking-wide text-primary/60 truncate mt-0.5">
                      {day.isActive ? describeTimes(day) : "Off — only dates you open below are bookable"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(editing === day.id ? null : day.id)}
                  className="shrink-0 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-accent-dark transition-all duration-300 hover:bg-accent hover:text-white active:scale-95 bg-accent/10"
                >
                  Edit Times
                </button>
              </div>
              <AnimatePresence>
                {editing === day.id && (
                  <TimeEditor
                    initial={day}
                    saving={busy === day.id}
                    onCancel={() => setEditing(null)}
                    onSave={(t) => updateWeekly(day, { startTime: t.start, endTime: t.end, timeSlots: t.timeSlots }, "Saved")}
                  />
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming weekends */}
      <div className="pt-8 border-t border-primary/10">
        <h2 className={sectionTitle}>Upcoming Weekends</h2>
        <p className={sectionHint}>Open or close a single date. This only changes that one day.</p>

        <div className="mt-4 space-y-4">
          {weekends.map((weekend) => (
            <div key={weekend[0].date} className="rounded-2xl border border-primary/10 bg-white/30 p-3 space-y-2">
              <p className="px-1 text-[10px] font-bold uppercase tracking-widest text-primary/50">
                Weekend of {formatDate(weekend[0].date, { day: "numeric", month: "long" })}
              </p>
              {weekend.map((d) => {
                const blocked = d.source === "blocked"
                const key = `date-${d.date}`
                return (
                  <div key={d.date}>
                    <div
                      className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${
                        d.open ? "border-primary/10 bg-white/70" : "border-dashed border-primary/10 bg-white/20"
                      }`}
                    >
                      <Toggle
                        on={d.open}
                        disabled={blocked || busy === key}
                        onClick={() => updateDates("PUT", [d.date], { isActive: !d.open }, key, `${formatDate(d.date)} ${d.open ? "closed" : "opened"}`)}
                        label={formatDate(d.date)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-bold ${d.open ? "text-primary" : "text-primary/40"}`}>
                          {formatDate(d.date)}
                          {d.source === "override" && (
                            <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-accent-dark">Changed</span>
                          )}
                          {d.booked && (
                            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary/70">Booked</span>
                          )}
                        </p>
                        <p className="text-[11px] font-medium text-primary/60 truncate">
                          {blocked ? `Blocked: ${d.blockedReason} (remove under Blocked Dates)` : d.open ? describeTimes(d) : "Closed"}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        {d.open && !blocked && (
                          <button
                            onClick={() => setEditing(editing === key ? null : key)}
                            className="rounded-full bg-accent/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-accent-dark hover:bg-accent hover:text-white transition-all"
                          >
                            Times
                          </button>
                        )}
                        {d.source === "override" && (
                          <button
                            onClick={() => updateDates("DELETE", [d.date], {}, key, `${formatDate(d.date)} reset to weekly schedule`)}
                            disabled={busy === key}
                            className="rounded-full border border-primary/10 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-all"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                    <AnimatePresence>
                      {editing === key && (
                        <TimeEditor
                          initial={{ start: d.start ?? "09:00", end: d.end ?? "17:00", timeSlots: d.timeSlots }}
                          saving={busy === key}
                          onCancel={() => setEditing(null)}
                          onSave={(t) =>
                            updateDates("PUT", [d.date], { isActive: true, startTime: t.start, endTime: t.end, timeSlots: t.timeSlots }, key, `${formatDate(d.date)} times saved`)
                          }
                        />
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <button
          onClick={showMoreWeeks}
          disabled={busy === "more"}
          className="mt-4 text-[10px] font-bold uppercase tracking-widest text-accent-dark hover:text-accent transition-all disabled:opacity-50"
        >
          {busy === "more" ? "Loading..." : `+ Show ${WEEKS_PER_PAGE} more weeks`}
        </button>
      </div>

      {/* Bulk edit */}
      <div className="pt-8 border-t border-primary/10">
        <h2 className={sectionTitle}>Close or Open Several Dates</h2>
        <p className={sectionHint}>E.g. close every Saturday from next week until the end of the year</p>

        <div className="mt-6 space-y-4 rounded-3xl border border-primary/10 bg-primary/5 p-6 sm:p-8">
          <div className="flex flex-wrap gap-2">
            {(["saturday", "sunday"] as const).map((day) => (
              <button
                key={day}
                onClick={() => setBulk({ ...bulk, [day]: !bulk[day] })}
                aria-pressed={bulk[day]}
                className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                  bulk[day] ? "bg-accent text-white shadow-md" : "bg-white text-primary/50 border border-primary/10"
                }`}
              >
                {day === "saturday" ? "Saturdays" : "Sundays"}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>From</label>
              <input type="date" min={today} value={bulk.from} onChange={(e) => setBulk({ ...bulk, from: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Until</label>
              <input type="date" min={bulk.from || today} value={bulk.to} onChange={(e) => setBulk({ ...bulk, to: e.target.value })} className={inputClass} />
            </div>
          </div>
          <p className="text-xs text-primary/60">
            {selectedBulkDates.length > 0
              ? `${selectedBulkDates.length} date${selectedBulkDates.length === 1 ? "" : "s"} selected: ${selectedBulkDates.slice(0, 4).map((d) => formatDate(d)).join(", ")}${selectedBulkDates.length > 4 ? "…" : ""}`
              : "Pick which days and a date range."}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => runBulk("close")}
              disabled={selectedBulkDates.length === 0 || busy === "bulk"}
              className="rounded-full bg-primary px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-primary-light active:scale-95 disabled:opacity-40"
            >
              Close these dates
            </button>
            <button
              onClick={() => runBulk("open")}
              disabled={selectedBulkDates.length === 0 || busy === "bulk"}
              className="rounded-full bg-accent px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-accent-dark active:scale-95 disabled:opacity-40"
            >
              Open these dates
            </button>
            <button
              onClick={() => runBulk("reset")}
              disabled={selectedBulkDates.length === 0 || busy === "bulk"}
              className="rounded-full border border-primary/10 bg-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-primary/70 transition-all hover:text-primary active:scale-95 disabled:opacity-40"
            >
              Reset to weekly
            </button>
          </div>
        </div>
      </div>

      {/* Blocked dates */}
      <div className="pt-8 border-t border-primary/10">
        <h2 className={sectionTitle}>Blocked Dates</h2>
        <p className={sectionHint}>Holidays or time away. Every day in the range is closed.</p>

        <div className="mt-6 space-y-4 rounded-3xl border border-primary/10 bg-primary/5 p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-end">
            <div className="col-span-1">
              <label className={labelClass}>From</label>
              <input
                type="date"
                value={newBlocked.fromDate}
                onChange={(e) => setNewBlocked({ ...newBlocked, fromDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="col-span-1">
              <label className={labelClass}>To</label>
              <input
                type="date"
                min={newBlocked.fromDate || undefined}
                value={newBlocked.toDate}
                onChange={(e) => setNewBlocked({ ...newBlocked, toDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <button
              onClick={addBlockedDate}
              disabled={busy === "blocked" || !newBlocked.fromDate}
              className="col-span-2 rounded-full bg-primary px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest text-white transition-all duration-200 hover:bg-primary-light active:scale-95 disabled:opacity-50 sm:w-auto sm:self-end shadow-md"
            >
              {busy === "blocked" ? "..." : "Add"}
            </button>
          </div>
          <input
            type="text"
            value={newBlocked.reason}
            onChange={(e) => setNewBlocked({ ...newBlocked, reason: e.target.value })}
            placeholder="Reason (optional) – e.g. Holiday, Appointment"
            className="block w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-sm font-medium text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
          />
        </div>

        {blockedDates.length > 0 ? (
          <div className="mt-4 space-y-2">
            {blockedDates.map((blocked) => (
              <div
                key={blocked.id}
                className={`flex items-center justify-between rounded-2xl border border-primary/10 bg-white/50 p-5 transition-colors hover:bg-white ${
                  (blocked.endDate ?? blocked.date) < today ? "opacity-50" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-primary">
                    {formatDate(blocked.date, { day: "numeric", month: "short", year: "numeric" })}
                    {blocked.endDate && blocked.endDate !== blocked.date && (
                      <span> – {formatDate(blocked.endDate, { day: "numeric", month: "short", year: "numeric" })}</span>
                    )}
                  </p>
                  {blocked.reason && (
                    <p className="text-[11px] font-bold uppercase tracking-widest text-primary/50 mt-1">{blocked.reason}</p>
                  )}
                </div>
                <button
                  onClick={() => removeBlockedDate(blocked.id)}
                  className="shrink-0 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-50 transition-all duration-200 hover:bg-red-500 hover:text-white active:scale-95"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
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
