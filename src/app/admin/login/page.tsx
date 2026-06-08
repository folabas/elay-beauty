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
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-4 w-full max-w-sm">
        <div className="rounded-xl border border-border bg-card p-8 shadow-elevated">
          <div className="text-center">
            <h1 className="font-serif text-2xl font-bold text-primary">
              Admin Login
            </h1>
            <p className="mt-2 text-sm text-muted">Sign in to manage bookings</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium text-primary">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-primary">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
