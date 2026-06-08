import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: "Admin Dashboard | EL.AY Beauty",
    template: "%s | EL.AY Beauty",
  },
  robots: "noindex",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
