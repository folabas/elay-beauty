import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard | EL.AY Beauty",
  robots: "noindex",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
