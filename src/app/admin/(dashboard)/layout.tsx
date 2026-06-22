import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AdminSidebar from "@/components/admin/AdminSidebar"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/admin/login")
  }

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30 z-0 pointer-events-none" />
      <div className="relative z-10 flex min-h-screen w-full">
        <AdminSidebar />
        <main className="flex-1 pt-14 lg:pt-0 min-w-0 overflow-x-auto">{children}</main>
      </div>
    </div>
  )
}
