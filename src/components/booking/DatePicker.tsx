"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const DAY_NAME_TO_NUMBER: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6,
}

interface DatePickerProps {
  selectedDate: string
  onSelectDate: (date: string) => void
}

export default function DatePicker({ selectedDate, onSelectDate }: DatePickerProps) {
  const [activeDays, setActiveDays] = useState<number[]>([])
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth())
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear())

  useEffect(() => {
    fetch("/api/availability")
      .then((res) => res.json())
      .then((data: { day: string; isActive: boolean }[]) => {
        const active = data
          .filter((d) => d.isActive)
          .map((d) => DAY_NAME_TO_NUMBER[d.day])
        setActiveDays(active)
      })
      .catch(() => {})
  }, [])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()

  const prevMonth = () => {
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

  const isDateAvailable = (day: number) => {
    const date = new Date(viewYear, viewMonth, day)
    if (date < today) return false
    const dayOfWeek = date.getDay()
    return activeDays.includes(dayOfWeek)
  }

  const handleSelectDay = (day: number) => {
    if (!isDateAvailable(day)) return
    const y = viewYear
    const m = String(viewMonth + 1).padStart(2, "0")
    const d = String(day).padStart(2, "0")
    onSelectDate(`${y}-${m}-${d}`)
  }

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-accent/10 hover:text-accent transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-serif text-lg font-semibold text-primary">
          {monthLabel}
        </span>
        <button
          onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-accent/10 hover:text-accent transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {DAY_NAMES.map((name) => (
          <div key={name} className="py-1 text-center text-xs font-semibold uppercase tracking-wider text-muted">
            {name}
          </div>
        ))}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const available = isDateAvailable(day)
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          const isSelected = dateStr === selectedDate

          return (
            <button
              key={day}
              onClick={() => handleSelectDay(day)}
              disabled={!available}
              className={`flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-all ${
                !available
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

      {activeDays.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3 text-xs text-muted">
          <span>Available:</span>
          {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            .filter((name) => activeDays.includes(DAY_NAME_TO_NUMBER[name]))
            .map((name) => (
              <span key={name} className="rounded-md bg-accent/10 px-2 py-0.5 font-medium text-accent-dark">
                {name.slice(0, 3)}
              </span>
            ))}
        </div>
      )}
    </div>
  )
}
