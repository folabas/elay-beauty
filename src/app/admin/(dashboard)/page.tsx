import { Calendar01Icon, Clock01Icon, BankIcon, UserGroupIcon, ArrowRight01Icon } from "hugeicons-react"
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
    { label: "Total Bookings", value: String(totalBookings), icon: Calendar01Icon, change: thisWeek > 0 ? `+${thisWeek} this week` : "No bookings yet" },
    { label: "Pending Deposits", value: String(pendingDeposits), icon: Clock01Icon, change: pendingDeposits === 1 ? "Awaiting payment" : "Awaiting payment" },
    { label: "Confirmed", value: String(confirmed), icon: UserGroupIcon, change: "Ready for service" },
    { label: "Revenue", value: `£${(revenueAgg._sum.totalPrice ?? 0).toFixed(0)}`, icon: BankIcon, change: "From confirmed bookings" },
  ]

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto pb-32">
      <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-primary">
        Dashboard<span className="text-accent">.</span>
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="glass-card border border-primary/10 rounded-[24px] p-6 shadow-elevated relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
                <Icon size={80} variant="stroke" />
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-6 relative z-10">
                <Icon size={24} variant="stroke" />
              </div>
              <p className="mt-4 text-3xl font-bold text-primary tracking-tight">{stat.value}</p>
              <p className="text-sm font-bold text-primary/70 uppercase tracking-widest mt-1">{stat.label}</p>
              <p className="mt-2 text-xs text-primary/50 font-medium">{stat.change}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-12 glass-card border border-primary/10 rounded-[32px] p-6 sm:p-8 shadow-elevated">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold text-primary">
            Recent Bookings
          </h2>
          <Link
            href="/admin/bookings"
            className="group flex items-center gap-2 px-4 py-2 rounded-full border border-primary/10 hover:bg-primary hover:text-white transition-all text-xs font-bold uppercase tracking-widest text-primary"
          >
            View all
            <ArrowRight01Icon size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-primary/10">
          {recentBookings.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-medium text-primary/50 uppercase tracking-widest">No bookings yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary/10 bg-primary/5 text-left text-[11px] font-bold uppercase tracking-widest text-primary/60">
                  <th className="px-6 py-4 whitespace-nowrap">Booking</th>
                  <th className="px-6 py-4 whitespace-nowrap">Client</th>
                  <th className="px-6 py-4 whitespace-nowrap">Service</th>
                  <th className="px-6 py-4 whitespace-nowrap">Date</th>
                  <th className="px-6 py-4 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="transition-colors hover:bg-black/5">
                    <td className="px-6 py-4 font-mono text-[11px] text-primary/50 tracking-wider">#{booking.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 font-bold text-sm text-primary">{booking.client.name}</td>
                    <td className="px-6 py-4 text-sm font-medium text-primary/80">{booking.service.name}</td>
                    <td className="px-6 py-4 text-sm font-medium text-primary/80">{formatDate(booking.date)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${
                          booking.status === "CONFIRMED"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : booking.status === "PENDING_DEPOSIT"
                              ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                              : booking.status === "CANCELLED"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {booking.status === "PENDING_DEPOSIT" ? "Pending" : booking.status}
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
