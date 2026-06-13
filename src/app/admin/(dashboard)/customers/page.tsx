"use client"

import { useState, useEffect } from "react"
import { ArrowLeft01Icon, Discount01Icon, UserGroupIcon, CheckmarkCircle01Icon } from "hugeicons-react"

interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  discount: number | null
  totalBookings: number
  completedBookings: number
  totalSpent: number
  lastBookingDate: string | null
  firstBookingDate: string | null
  isReturning: boolean
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—"
  return new Date(dateStr).toISOString().split("T")[0]
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/users")
        if (res.ok) {
          setCustomers(await res.json())
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function saveDiscount(id: string) {
    const val = editValue === "" ? null : parseFloat(editValue)
    if (val !== null && (isNaN(val) || val < 0 || val > 100)) return

    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discount: val }),
    })

    if (res.ok) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, discount: val } : c))
      )
    }
    setEditingId(null)
  }

  function startEdit(customer: Customer) {
    setEditingId(customer.id)
    setEditValue(customer.discount?.toString() ?? "")
  }

  function formatPhone(phone: string | null) {
    if (!phone) return "—"
    return phone
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-10 max-w-7xl mx-auto pb-32">
        <p className="text-sm text-primary/50">Loading customers...</p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto pb-32">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-primary">
          Customers<span className="text-accent">.</span>
        </h1>
        <span className="rounded-full bg-accent/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-accent-dark">
          {customers.length} total
        </span>
      </div>

      <div className="glass-card border border-primary/10 rounded-[32px] p-6 sm:p-8 shadow-elevated overflow-x-auto">
        {customers.length === 0 ? (
          <div className="py-16 text-center">
            <UserGroupIcon size={48} className="mx-auto text-primary/20" />
            <p className="mt-4 text-sm font-medium text-primary/50 uppercase tracking-widest">
              No customers yet
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-primary/10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary/10 bg-primary/5 text-left text-[11px] font-bold uppercase tracking-widest text-primary/60">
                  <th className="px-6 py-4 whitespace-nowrap">Customer</th>
                  <th className="px-6 py-4 whitespace-nowrap">Contact</th>
                  <th className="px-6 py-4 whitespace-nowrap">Bookings</th>
                  <th className="px-6 py-4 whitespace-nowrap">Total Spent</th>
                  <th className="px-6 py-4 whitespace-nowrap">Last Visit</th>
                  <th className="px-6 py-4 whitespace-nowrap">Loyalty Discount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {customers.map((customer) => (
                  <tr key={customer.id} className="transition-colors hover:bg-black/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-primary">{customer.name}</span>
                        {customer.isReturning && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-dark">
                            <CheckmarkCircle01Icon size={12} />
                            Returning
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-primary">{customer.email}</p>
                        <p className="text-xs text-primary/50">{formatPhone(customer.phone)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-sm text-primary">{customer.totalBookings}</span>
                      <span className="text-xs text-primary/50 ml-1">
                        ({customer.completedBookings} completed)
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-sm text-primary">
                        £{customer.totalSpent.toFixed(0)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-primary/80">
                        {formatDate(customer.lastBookingDate)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === customer.id ? (
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-20 rounded-lg border border-primary/10 bg-white/50 px-3 py-1.5 text-sm font-medium text-primary focus:border-accent focus:ring-4 focus:ring-accent/10 focus:outline-none"
                              placeholder="0"
                              min="0"
                              max="100"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveDiscount(customer.id)
                                if (e.key === "Escape") setEditingId(null)
                              }}
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary/40">%</span>
                          </div>
                          <button
                            onClick={() => saveDiscount(customer.id)}
                            className="rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-primary-light transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(customer)}
                          className="group flex items-center gap-1 text-sm font-medium text-primary/70 hover:text-primary transition-colors"
                        >
                          <Discount01Icon size={16} className="text-primary/40 group-hover:text-accent" />
                          {customer.discount !== null ? (
                            <span className="text-accent-dark font-bold">{customer.discount}% off</span>
                          ) : (
                            <span className="text-primary/40 italic">Set discount</span>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
