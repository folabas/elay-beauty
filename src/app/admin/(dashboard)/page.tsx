"use client"

import { CalendarDays, Clock, DollarSign, Users } from "lucide-react"
import Link from "next/link"

const stats = [
  { label: "Total Bookings", value: "12", icon: CalendarDays, change: "+3 this week" },
  { label: "Pending Deposits", value: "4", icon: Clock, change: "Awaiting payment" },
  { label: "Confirmed", value: "7", icon: Users, change: "Ready for service" },
  { label: "Revenue", value: "£840", icon: DollarSign, change: "This month" },
]

const recentBookings = [
  { id: "001", client: "Jane Smith", service: "Boho Braids", date: "2026-06-12", status: "Confirmed" },
  { id: "002", client: "Amy Jones", service: "Knotless Braids", date: "2026-06-13", status: "Pending" },
  { id: "003", client: "Rose Tyler", service: "Cornrows", date: "2026-06-14", status: "Confirmed" },
]

export default function AdminDashboard() {
  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-serif text-xl font-bold text-primary">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-5 shadow-soft"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm font-medium text-primary">{stat.label}</p>
              <p className="mt-0.5 text-xs text-muted">{stat.change}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-primary">
            Recent Bookings
          </h2>
          <Link
            href="/admin/bookings"
            className="text-sm font-medium text-accent-dark hover:text-accent"
          >
            View all
          </Link>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <table className="w-full">
            <thead>
              <tr className="bg-card text-left text-sm font-medium text-muted">
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="bg-card text-sm">
                  <td className="px-4 py-3 font-medium text-primary">#{booking.id}</td>
                  <td className="px-4 py-3 text-primary">{booking.client}</td>
                  <td className="px-4 py-3 text-muted">{booking.service}</td>
                  <td className="px-4 py-3 text-muted">{booking.date}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        booking.status === "Confirmed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
