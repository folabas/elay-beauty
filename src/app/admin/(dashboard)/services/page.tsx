"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const CATEGORIES = ["BRAIDS", "NATURAL", "CHILDREN"] as const
const CATEGORY_LABELS: Record<string, string> = {
  BRAIDS: "Braids",
  NATURAL: "Natural Hair Styles",
  CHILDREN: "Children's Styles",
}

interface Service {
  id: string
  name: string
  category: string
  description: string | null
  price: number
  duration: number | null
  requiresHairInfo: boolean
  isActive: boolean
  imageUrl: string | null
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: "",
    category: "BRAIDS",
    price: "",
    description: "",
    duration: "",
    requiresHairInfo: true,
    imageUrl: "",
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const res = await fetch("/api/services")
      if (res.ok) setServices(await res.json())
    } catch {
      showToast("Failed to load services")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({ name: "", category: "BRAIDS", price: "", description: "", duration: "", requiresHairInfo: true, imageUrl: "" })
    setEditingId(null)
    setShowForm(false)
  }

  const openEdit = (service: Service) => {
    setForm({
      name: service.name,
      category: service.category,
      price: String(service.price),
      description: service.description || "",
      duration: service.duration ? String(service.duration) : "",
      requiresHairInfo: service.requiresHairInfo,
      imageUrl: service.imageUrl || "",
    })
    setEditingId(service.id)
    setShowForm(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (res.ok) {
        const { url } = await res.json()
        setForm({ ...form, imageUrl: url })
      } else {
        showToast("Upload failed")
      }
    } catch {
      showToast("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const saveService = async () => {
    if (!form.name || !form.price) return
    setSaving(true)

    try {
      const body = {
        ...(editingId ? { id: editingId } : {}),
        name: form.name,
        category: form.category,
        price: parseFloat(form.price),
        description: form.description || null,
        duration: form.duration ? parseInt(form.duration) : null,
        requiresHairInfo: form.requiresHairInfo,
        imageUrl: form.imageUrl || null,
      }

      const res = await fetch("/api/services", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const saved = await res.json()
        if (editingId) {
          setServices(services.map((s) => (s.id === editingId ? saved : s)))
        } else {
          setServices([...services, saved])
        }
        resetForm()
        showToast(editingId ? "Service updated" : "Service added")
      } else {
        showToast("Failed to save service")
      }
    } catch {
      showToast("Failed to save service")
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (service: Service) => {
    try {
      const res = await fetch("/api/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: service.id, isActive: !service.isActive }),
      })
      if (res.ok) {
        setServices(services.map((s) => (s.id === service.id ? { ...s, isActive: !s.isActive } : s)))
      } else {
        showToast("Failed to update service")
      }
    } catch {
      showToast("Failed to update service")
    }
  }

  const deleteService = async (id: string) => {
    if (!confirm("Delete this service? This cannot be undone.")) return
    try {
      const res = await fetch(`/api/services?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setServices(services.filter((s) => s.id !== id))
        showToast("Service deleted")
      } else {
        showToast("Failed to delete service")
      }
    } catch {
      showToast("Failed to delete service")
    }
  }

  const groupedServices = CATEGORIES.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: services.filter((s) => s.category === cat),
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm text-muted">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl font-bold text-primary">Services & Pricing</h1>
          <p className="mt-1 text-sm text-muted">Manage your services, prices, and availability</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all hover:bg-accent-dark active:scale-95"
        >
          Add Service
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            className="mt-6 rounded-xl border border-accent/20 bg-accent/5 p-6"
          >
            <h2 className="font-serif text-lg font-bold text-primary mb-4">
              {editingId ? "Edit Service" : "New Service"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-primary focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-primary focus:border-accent focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Price (£) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-primary focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Duration (minutes)</label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-primary focus:border-accent focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-primary focus:border-accent focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted">Image</label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted transition-all hover:text-primary active:scale-95">
                      {uploading ? "Uploading..." : "Choose file"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-muted">or paste URL</span>
                    <input
                      type="text"
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
                    />
                  </div>
                  {form.imageUrl && (
                    <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-border bg-background">
                      <img src={form.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.requiresHairInfo}
                    onChange={(e) => setForm({ ...form, requiresHairInfo: e.target.checked })}
                    className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                  />
                  <span className="text-xs text-muted">Requires hair length/type info at booking</span>
                </label>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={saveService}
                disabled={saving || !form.name || !form.price}
                className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-white transition-all hover:bg-accent-dark active:scale-95 disabled:opacity-50"
              >
                {saving ? "..." : editingId ? "Update" : "Add"}
              </button>
              <button
                onClick={resetForm}
                className="rounded-lg border border-border px-6 py-2 text-sm font-medium text-muted transition-all hover:text-primary active:scale-95"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 space-y-10">
        {groupedServices.map((group) => (
          <div key={group.category}>
            <h2 className="font-serif text-lg font-bold text-primary mb-3">{group.label}</h2>
            {group.items.length === 0 ? (
              <p className="text-sm text-muted">No services in this category</p>
            ) : (
              <div className="space-y-2">
                {group.items.map((service) => (
                  <div
                    key={service.id}
                    className={`flex items-center justify-between rounded-lg border p-4 transition-all hover:bg-accent/5 ${
                      service.isActive ? "border-border bg-card" : "border-dashed border-border bg-card/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {service.imageUrl && (
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                          <img src={service.imageUrl} alt="" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <div>
                        <p className={`text-sm font-medium ${service.isActive ? "text-primary" : "text-muted"}`}>
                          {service.name}
                        </p>
                        <p className="text-xs text-muted">
                          £{service.price}
                          {service.duration && <span> · {service.duration}min</span>}
                          {service.description && <span> · {service.description}</span>}
                          {!service.isActive && <span> · Disabled</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <button
                        onClick={() => toggleActive(service)}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                          service.isActive
                            ? "text-muted hover:text-red-500"
                            : "text-muted hover:text-green-600"
                        }`}
                      >
                        {service.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => openEdit(service)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-accent-dark transition-all hover:bg-accent/10 active:scale-95"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteService(service.id)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 transition-all hover:bg-red-50 active:scale-95"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-lg bg-primary px-4 py-3 text-center text-sm text-white shadow-elevated md:left-auto md:right-4 md:max-w-md md:text-left"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
