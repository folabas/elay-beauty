"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid email or password")
      setLoading(false)
    } else {
      router.push("/admin")
    }
  }

  return (
  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-grid relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 pointer-events-none" />
      <div className="mx-4 w-full max-w-sm relative z-10">
        <div className="glass-card border border-primary/10 rounded-[32px] p-8 sm:p-10 shadow-elevated">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-primary">
              Admin<span className="text-accent">.</span>
            </h1>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-primary/50">Manage your bookings</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-primary/60">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-2xl border border-primary/10 bg-white/50 px-4 py-3 text-sm font-medium text-primary focus:border-accent focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-primary/30"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-primary/60">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-2xl border border-primary/10 bg-white/50 px-4 py-3 text-sm font-medium text-primary focus:border-accent focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-primary/30"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-[11px] font-bold uppercase tracking-widest text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-primary px-4 py-3.5 text-[11px] font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-primary-light active:scale-95 disabled:opacity-50 shadow-md hover:-translate-y-1 hover:shadow-glow press-effect"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
