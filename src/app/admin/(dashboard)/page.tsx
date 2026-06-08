import { CalendarDays, Clock, DollarSign, Users } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

function formatDate(date: Date) {
  return date.toISOString().split("T")[0]
}

export default async function AdminDashboard() {
  const totalBookings = await prisma.booking.count()
  const pendingDeposits = await prisma.booking.count({ where: { status: "PENDING_DEPOSIT" } })
  const confirmed = await prisma.booking.count({ where: { status: "CONFIRMED" } })
  const revenueAgg = await prisma.booking.aggregate({
    where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
    _sum: { totalPrice: true },
  })
  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { client: true, service: true },
  })

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const thisWeek = await prisma.booking.count({ where: { createdAt: { gte: weekAgo } } })

  const stats = [
    { label: "Total Bookings", value: String(totalBookings), icon: CalendarDays, change: thisWeek > 0 ? `+${thisWeek} this week` : "No bookings yet" },
    { label: "Pending Deposits", value: String(pendingDeposits), icon: Clock, change: pendingDeposits === 1 ? "Awaiting payment" : "Awaiting payment" },
    { label: "Confirmed", value: String(confirmed), icon: Users, change: "Ready for service" },
    { label: "Revenue", value: `£${(revenueAgg._sum.totalPrice ?? 0).toFixed(0)}`, icon: DollarSign, change: "From confirmed bookings" },
  ]

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
          {recentBookings.length === 0 ? (
            <div className="bg-card py-12 text-center">
              <p className="text-sm text-muted">No bookings yet</p>
            </div>
          ) : (
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
                    <td className="px-4 py-3 font-mono text-xs text-muted">#{booking.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 font-medium text-primary">{booking.client.name}</td>
                    <td className="px-4 py-3 text-muted">{booking.service.name}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(booking.date)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          booking.status === "CONFIRMED"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "PENDING_DEPOSIT"
                              ? "bg-yellow-100 text-yellow-700"
                              : booking.status === "CANCELLED"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {booking.status === "PENDING_DEPOSIT" ? "Pending" : booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
