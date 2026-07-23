"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const CATEGORIES = ["BRAIDS", "NATURAL", "CHILDREN"] as const
const CATEGORY_LABELS: Record<string, string> = {
  BRAIDS: "Braids",
  NATURAL: "Natural Hair Styles",
  CHILDREN: "Children (12 years and below)",
}

interface PricingTier {
  name: string
  price: number
}

interface Service {
  id: string
  name: string
  category: string
  description: string | null
  price: number
  pricingTier: PricingTier[] | null
  duration: number | null
  durationRange: string | null
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
    category: "BRAIDS" as string,
    price: "",
    pricingTier: [] as PricingTier[],
    description: "",
    durationRange: "",
    requiresHairInfo: true,
    imageUrl: "",
  })
  const [pricingMode, setPricingMode] = useState<"single" | "tier">("single")
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
    setForm({ name: "", category: "BRAIDS", price: "", pricingTier: [], description: "", durationRange: "", requiresHairInfo: true, imageUrl: "" })
    setPricingMode("single")
    setEditingId(null)
    setShowForm(false)
  }

  const openEdit = (service: Service) => {
    setForm({
      name: service.name,
      category: service.category,
      price: String(service.price),
      pricingTier: service.pricingTier || [],
      description: service.description || "",
      durationRange: service.durationRange || "",
      requiresHairInfo: service.requiresHairInfo,
      imageUrl: service.imageUrl || "",
    })
    setPricingMode(service.pricingTier && service.pricingTier.length > 0 ? "tier" : "single")
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
    if (!form.name) return
    if (pricingMode === "single" && !form.price) return
    if (pricingMode === "tier" && form.pricingTier.some((t) => !t.price)) return
    setSaving(true)

    try {
      const body: Record<string, unknown> = {
        ...(editingId ? { id: editingId } : {}),
        name: form.name,
        category: form.category,
        price: pricingMode === "single" ? parseFloat(form.price) : 0,
        pricingTier: pricingMode === "tier" ? form.pricingTier : null,
        description: form.description || null,
        durationRange: form.durationRange || null,
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
    <div className="p-6 lg:p-10 max-w-7xl mx-auto pb-32">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-primary">
            Services<span className="text-accent">.</span>
          </h1>
          <p className="mt-2 text-sm font-bold tracking-widest uppercase text-primary/50">Manage your services, prices, and availability</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="w-full sm:w-auto rounded-full bg-primary px-6 py-4 sm:py-3 text-[11px] font-bold uppercase tracking-widest text-white hover:bg-primary-light transition-all shadow-md hover:-translate-y-1 hover:shadow-glow"
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
            className="mt-8 glass-card border border-primary/10 rounded-[32px] p-6 sm:p-8 shadow-elevated overflow-hidden"
          >
            <h2 className="font-serif text-2xl font-bold text-primary mb-6">
              {editingId ? "Edit Service" : "New Service"}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-primary/70">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="block w-full rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm font-medium text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
                />
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-primary/70">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="block w-full rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm font-medium text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-primary/70">Pricing</label>
                <div className="flex items-center gap-2 bg-white/50 p-1 rounded-xl border border-primary/10 w-fit mb-3">
                  <button
                    onClick={() => setPricingMode("single")}
                    className={`rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                      pricingMode === "single" ? "bg-primary text-white shadow-md" : "text-primary/60 hover:text-primary"
                    }`}
                  >
                    Single Price
                  </button>
                  <button
                    onClick={() => setPricingMode("tier")}
                    className={`rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                      pricingMode === "tier" ? "bg-primary text-white shadow-md" : "text-primary/60 hover:text-primary"
                    }`}
                  >
                    Size Variants
                  </button>
                </div>
                {pricingMode === "single" ? (
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="block w-full rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm font-medium text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
                  />
                ) : (
                  <div className="space-y-3">
                    {["Small", "Medium", "Large"].map((size) => {
                      const tier = form.pricingTier.find((t) => t.name === size)
                      return (
                        <div key={size} className="flex items-center gap-3">
                          <span className="w-16 text-sm font-bold text-primary/70 uppercase tracking-wider">{size}</span>
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-primary/40 font-medium">£</span>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={tier?.price ?? ""}
                              onChange={(e) => {
                                const val = e.target.value ? parseFloat(e.target.value) : 0
                                const updated = [...form.pricingTier.filter((t) => t.name !== size), { name: size, price: val }]
                                setForm({ ...form, pricingTier: updated })
                              }}
                              className="block w-full rounded-xl border border-primary/10 bg-primary/5 pl-8 pr-4 py-2.5 text-sm font-medium text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-primary/70">Duration</label>
                <input
                  type="text"
                  value={form.durationRange}
                  onChange={(e) => setForm({ ...form, durationRange: e.target.value })}
                  placeholder='e.g. "2 – 7 hrs"'
                  className="block w-full rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm font-medium text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-primary/70">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="block w-full rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm font-medium text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-primary/70">Image</label>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer rounded-xl border border-primary/10 bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-primary/70 transition-all hover:text-primary active:scale-95 shadow-sm">
                        {uploading ? "Uploading..." : "Choose file"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-primary/40">or paste URL</span>
                    </div>
                    <input
                      type="text"
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm font-medium text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
                    />
                  </div>
                  {form.imageUrl && (
                    <div className="relative h-32 w-32 overflow-hidden rounded-2xl border border-primary/10 bg-primary/5 shadow-sm">
                      <img src={form.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.requiresHairInfo}
                    onChange={(e) => setForm({ ...form, requiresHairInfo: e.target.checked })}
                    className="h-5 w-5 rounded border-primary/20 text-accent focus:ring-accent"
                  />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-primary/70">Requires hair length/type info at booking</span>
                </label>
              </div>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={saveService}
                disabled={saving || !form.name || (pricingMode === "single" && !form.price) || (pricingMode === "tier" && form.pricingTier.every((t) => !t.price))}
                className="w-full sm:w-auto rounded-full bg-accent px-8 py-4 sm:py-3 text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:bg-accent-dark active:scale-95 disabled:opacity-50 shadow-md hover:-translate-y-1 hover:shadow-glow"
              >
                {saving ? "..." : editingId ? "Update" : "Add Service"}
              </button>
              <button
                onClick={resetForm}
                className="w-full sm:w-auto rounded-full border border-primary/10 bg-white px-8 py-4 sm:py-3 text-[11px] font-bold uppercase tracking-widest text-primary/70 transition-all hover:text-primary active:scale-95 shadow-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 space-y-10">
        {groupedServices.map((group) => (
          <div key={group.category} className="glass-card border border-primary/10 rounded-[32px] p-6 sm:p-8 shadow-elevated overflow-hidden">
            <h2 className="font-serif text-2xl font-bold text-primary mb-6">{group.label}</h2>
            {group.items.length === 0 ? (
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary/50 text-center py-8">No services in this category</p>
            ) : (
              <div className="space-y-3">
                {group.items.map((service) => (
                  <div
                    key={service.id}
                    className={`grid grid-cols-1 sm:grid-cols-[1fr_auto] items-start sm:items-center gap-3 rounded-2xl border p-4 sm:p-5 transition-all hover:bg-black/5 overflow-hidden ${
                      service.isActive ? "border-primary/10 bg-white/50" : "border-dashed border-primary/10 bg-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0 overflow-hidden">
                      {service.imageUrl && (
                        <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-xl border border-primary/10 shadow-sm">
                          <img src={service.imageUrl} alt="" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <div className="min-w-0 overflow-hidden">
                        <p className={`text-base font-bold truncate ${service.isActive ? "text-primary" : "text-primary/50"}`}>
                          {service.name}
                        </p>
                        <p className="text-[11px] font-medium tracking-wide text-primary/70 mt-1 leading-relaxed break-words">
                          {service.pricingTier && service.pricingTier.length > 0
                            ? service.pricingTier.map((t) => `${t.name}: £${t.price}`).join(", ")
                            : `£${service.price}`
                          }
                          {service.durationRange && <span> · {service.durationRange}</span>}
                          {service.description && <span className="hidden sm:inline"> · {service.description.length > 40 ? service.description.slice(0, 40) + "…" : service.description}</span>}
                          {!service.isActive && <span> · Disabled</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-start sm:justify-end">
                      <button
                        onClick={() => toggleActive(service)}
                        className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 press-effect ${
                          service.isActive
                            ? "bg-primary/5 text-primary/50 hover:bg-red-50 hover:text-red-500"
                            : "bg-primary/5 text-primary/50 hover:bg-green-50 hover:text-green-600"
                        }`}
                      >
                        {service.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => openEdit(service)}
                        className="rounded-full bg-accent/10 text-accent-dark px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-accent hover:text-white active:scale-95 press-effect"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteService(service.id)}
                        className="rounded-full bg-red-50 text-red-500 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-red-500 hover:text-white active:scale-95 press-effect"
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
