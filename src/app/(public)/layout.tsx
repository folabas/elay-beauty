import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
    </div>
  )
}
