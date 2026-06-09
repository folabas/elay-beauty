"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import { SERVICE_IMAGES, type BookingFormData } from "@/types"
import DatePicker from "@/components/booking/DatePicker"
import { CheckCircle, ArrowRight, ArrowLeft, GraduationCap } from "lucide-react"

type Step = "service" | "datetime" | "details" | "payment" | "confirmation"

export default function BookingPage() {
  const [step, setStep] = useState<Step>("service")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedService, setSelectedService] = useState<{ name: string; price: number } | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    hairLength: "",
    hairType: "",
    notes: "",
    isStudent: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [emailWarnings, setEmailWarnings] = useState<string[]>([])
  const [agreedToPolicies, setAgreedToPolicies] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<{ time: string; available: boolean }[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [isSunday, setIsSunday] = useState(false)
  const [dayFull, setDayFull] = useState(false)
  const stepContainerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (stepContainerRef.current) {
      gsap.fromTo(stepContainerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      )
    }
  }, [step])

  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([])
      setSelectedTime("")
      return
    }

      async function fetchSlots() {
      setSlotsLoading(true)
      setSelectedTime("")
      setDayFull(false)
      try {
        const res = await fetch(`/api/availability/slots?date=${selectedDate}`)
        if (res.ok) {
          const data = await res.json()
          setAvailableSlots(data.slots || [])
          setIsSunday(data.isSunday || false)
          setDayFull(data.dayFull || false)
        } else {
          setAvailableSlots([])
        }
      } catch {
        setAvailableSlots([])
      } finally {
        setSlotsLoading(false)
      }
    }

    fetchSlots()
  }, [selectedDate])

  const [allServices, setAllServices] = useState<{ name: string; price: number; category: string; id: string }[]>([])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/services")
        if (res.ok) {
          const data = await res.json()
          setAllServices(data.map((s: { name: string; price: number; category: string; id: string }) => ({ ...s, category: s.category })))
        }
      } catch { /* ignore */ }
    }
    load()
  }, [])

  const filteredServices = selectedCategory
    ? allServices.filter((s) => s.category === selectedCategory)
    : allServices

  const handleSelectService = (name: string, price: number) => {
    setSelectedService({ name, price })
    setStep("datetime")
  }

  const handleDateTimeNext = () => {
    if (!selectedDate || !selectedTime) {
      setErrors({ datetime: "Please select both a date and time" })
      return
    }
    setErrors({})
    setStep("details")
  }

  const handleDetailsNext = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address"
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone is required"
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    setStep("payment")
  }

  const handleConfirm = async () => {
    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          serviceName: selectedService?.name,
          date: selectedDate,
          time: selectedTime,
          hairLength: formData.hairLength || undefined,
          hairType: formData.hairType || undefined,
          notes: formData.notes || undefined,
          isStudent: formData.isStudent,
          totalPrice: finalPrice,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to create booking")
      }

      setBookingId(data.id)
      setEmailWarnings(data.emailWarnings || [])
      setStep("confirmation")
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  const totalPrice = selectedService?.price ?? 0
  const finalPrice = formData.isStudent && ["BRAIDS", "NATURAL"].includes(selectedCategory)
    ? totalPrice * 0.8
    : totalPrice
  const depositRequired = true

  const renderProgress = () => {
    const steps: { key: Step; label: string }[] = [
      { key: "service", label: "Service" },
      { key: "datetime", label: "Date & Time" },
      { key: "details", label: "Details" },
      { key: "payment", label: "Payment" },
    ]
    const currentIndex = steps.findIndex((s) => s.key === step)

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                  i <= currentIndex
                    ? "bg-accent text-primary"
                    : "border border-primary/10 text-muted"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`ml-2 hidden text-sm font-medium sm:block ${
                  i <= currentIndex ? "text-primary" : "text-muted"
                }`}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={`mx-2 h-px w-8 sm:w-12 ${
                    i < currentIndex ? "bg-accent" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderServiceStep = () => (
    <div>
      <h2 className="font-serif text-2xl font-bold text-primary">Choose Your Service</h2>
      <p className="mt-2 text-muted">Select a category to browse available styles</p>

      {errors.service && (
        <p className="mt-2 text-sm text-red-500">{errors.service}</p>
      )}

      <div className="mt-6 flex gap-2">
        {["", "BRAIDS", "NATURAL", "CHILDREN"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? "bg-accent text-primary"
                : "border border-primary/10 glass-card text-muted hover:border-accent/30"
            }`}
          >
            {cat === "" ? "All" : cat === "BRAIDS" ? "Braids" : cat === "NATURAL" ? "Natural" : "Children"}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {filteredServices.map((service) => (
          <button
            key={service.name}
            onClick={() => handleSelectService(service.name, service.price)}
            className={`flex items-center justify-between rounded-xl border p-5 shadow-sm press-effect text-left transition-all hover:border-accent/30 hover:shadow-card ${
              selectedService?.name === service.name
                ? "border-accent bg-accent/5"
                : "border-primary/10 glass-card"
            }`}
          >
            <div className="flex items-center gap-3">
              {SERVICE_IMAGES[service.name] && (
                <img
                  src={SERVICE_IMAGES[service.name]}
                  alt={service.name}
                  className="h-10 w-10 shrink-0 rounded-md object-cover"
                />
              )}
              <span className="text-sm font-medium text-primary">{service.name}</span>
            </div>
            <span className="font-serif font-bold text-accent-dark">£{service.price}</span>
          </button>
        ))}
      </div>
    </div>
  )

  const renderDateTimeStep = () => (
    <div>
      <h2 className="font-serif text-2xl font-bold text-primary">Pick Date & Time</h2>
      <p className="mt-2 text-muted">Choose from available slots</p>

      {errors.datetime && (
        <p className="mt-2 text-sm text-red-500">{errors.datetime}</p>
      )}

      <div className="mt-6 space-y-4">
        <DatePicker selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        {selectedDate && (
          <div>
            {slotsLoading ? (
              <p className="text-sm text-muted">Loading available slots...</p>
            ) : availableSlots.length === 0 && dayFull ? (
              <p className="text-sm text-muted">This day is already booked. Please choose another date.</p>
            ) : availableSlots.length === 0 ? (
              <p className="text-sm text-muted">No available slots on this date</p>
            ) : (
              <>
                {isSunday && (
                  <p className="mb-2 text-xs text-accent-dark">
                    Sunday: only Cornrows and Crotchet available
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                        !slot.available
                          ? "border-primary/10 glass-card/50 text-muted-light line-through cursor-not-allowed"
                          : selectedTime === slot.time
                            ? "border-accent bg-accent text-primary"
                            : "border-primary/10 glass-card text-muted hover:border-accent/30"
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => { setStep("service"); setSelectedService(null) }}
          className="flex items-center gap-2 text-sm font-medium text-muted hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={handleDateTimeNext}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 shadow-elevated press-effect text-sm font-medium text-white hover:bg-primary-light"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )

  const renderDetailsStep = () => (
    <div>
      <h2 className="font-serif text-2xl font-bold text-primary">Your Details</h2>
      <p className="mt-2 text-muted">Fill in your information to complete the booking</p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-primary">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-xl border border-primary/10 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm text-primary focus:border-accent focus:ring-4 focus:ring-accent/10 focus:outline-none transition-all"
            placeholder="Jane Doe"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-primary">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 block w-full rounded-xl border border-primary/10 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm text-primary focus:border-accent focus:ring-4 focus:ring-accent/10 focus:outline-none transition-all"
            placeholder="jane@example.com"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-primary">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="mt-1 block w-full rounded-xl border border-primary/10 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm text-primary focus:border-accent focus:ring-4 focus:ring-accent/10 focus:outline-none transition-all"
            placeholder="+44 7XXX XXXXXX"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-primary">Hair Length</label>
            <select
              value={formData.hairLength}
              onChange={(e) => setFormData({ ...formData, hairLength: e.target.value })}
              className="mt-1 block w-full rounded-xl border border-primary/10 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm text-primary focus:border-accent focus:ring-4 focus:ring-accent/10 focus:outline-none transition-all"
            >
              <option value="">Select...</option>
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-primary">Hair Type</label>
            <select
              value={formData.hairType}
              onChange={(e) => setFormData({ ...formData, hairType: e.target.value })}
              className="mt-1 block w-full rounded-xl border border-primary/10 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm text-primary focus:border-accent focus:ring-4 focus:ring-accent/10 focus:outline-none transition-all"
            >
              <option value="">Select...</option>
              <option value="natural">Natural</option>
              <option value="relaxed">Relaxed</option>
              <option value="short">Short Hair</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-primary">Additional Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="mt-1 block w-full rounded-xl border border-primary/10 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm text-primary focus:border-accent focus:ring-4 focus:ring-accent/10 focus:outline-none transition-all"
            rows={3}
            placeholder="Any special requests or information..."
          />
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-primary/10 glass-card p-3">
          <input
            type="checkbox"
            checked={formData.isStudent}
            onChange={(e) => setFormData({ ...formData, isStudent: e.target.checked })}
            className="h-4 w-4 rounded border-primary/10 text-accent focus:ring-accent"
          />
          <div>
            <span className="text-sm font-medium text-primary">I am a student</span>
            <p className="text-xs text-muted">20% off any braiding style (valid ID required)</p>
          </div>
        </label>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setStep("datetime")}
          className="flex items-center gap-2 text-sm font-medium text-muted hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={handleDetailsNext}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 shadow-elevated press-effect text-sm font-medium text-white hover:bg-primary-light"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )

  const renderPaymentStep = () => {
    const priceBreakdown = [
      { label: selectedService?.name ?? "", amount: totalPrice },
    ]
    if (formData.isStudent) {
      priceBreakdown.push({ label: "Student Discount (20%)", amount: -(totalPrice * 0.2) })
    }

    return (
      <div>
        <h2 className="font-serif text-2xl font-bold text-primary">Booking Summary</h2>
        <p className="mt-2 text-muted">Review your booking details</p>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-primary/10 glass-card p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">Service</h3>
            <p className="mt-1 text-primary">{selectedService?.name}</p>
            <p className="mt-1 text-sm text-muted">
              {selectedDate} at {selectedTime}
            </p>
          </div>

          <div className="rounded-lg border border-primary/10 glass-card p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">Personal Info</h3>
            <div className="mt-2 space-y-1 text-sm">
              <p><span className="text-muted">Name:</span> {formData.name}</p>
              <p><span className="text-muted">Email:</span> {formData.email}</p>
              <p><span className="text-muted">Phone:</span> {formData.phone}</p>
              {formData.hairLength && <p><span className="text-muted">Hair Length:</span> {formData.hairLength}</p>}
              {formData.hairType && <p><span className="text-muted">Hair Type:</span> {formData.hairType}</p>}
              {formData.isStudent && <p className="text-accent-dark">✓ Student discount applied</p>}
            </div>
          </div>

          <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
            <div className="space-y-2">
              {priceBreakdown.map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-muted">{item.label}</span>
                  <span className="font-medium text-primary">
                    {item.amount >= 0 ? `£${item.amount.toFixed(2)}` : `-£${Math.abs(item.amount).toFixed(2)}`}
                  </span>
                </div>
              ))}
              <div className="border-t border-primary/10 pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-primary">Total</span>
                  <span className="font-serif text-xl font-bold text-accent-dark">
                    £{finalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-primary/10 glass-card p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Deposit Required
            </h3>
            <div className="mt-2 space-y-2">
              <p className="text-sm text-muted">
                A £20 deposit is required to secure your booking. Send to:
              </p>
              <div className="rounded-md glass-card p-3 text-sm">
                <p><span className="text-muted">Bank:</span> Monzo</p>
                <p><span className="text-muted">Name:</span> Elizabeth Ayedebinu</p>
                <p><span className="text-muted">Sort Code:</span> 04-00-03</p>
                <p><span className="text-muted">Account:</span> 34563358</p>
                <p><span className="text-muted">Reference:</span> Hair</p>
              </div>
              <p className="text-xs text-muted">
                Your booking will be confirmed once we receive the deposit.
              </p>
            </div>
          </div>
        </div>

        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-lg border border-primary/10 glass-card p-4">
          <input
            type="checkbox"
            checked={agreedToPolicies}
            onChange={(e) => setAgreedToPolicies(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-primary/10 text-accent focus:ring-accent"
          />
          <div>
            <span className="text-sm font-medium text-primary">
              I have read and agree to the booking policies
            </span>
            <p className="mt-0.5 text-xs text-muted">
              Including deposit, late arrival, cancellation, and pricing policies.
              View policies at{" "}
              <a href="/policies" target="_blank" className="text-accent-dark underline">
                elay-beauty.vercel.app/policies
              </a>
            </p>
          </div>
        </label>

        {submitError && (
          <p className="mt-4 text-sm text-red-500">{submitError}</p>
        )}

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setStep("details")}
            className="flex items-center gap-2 text-sm font-medium text-muted hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting || !agreedToPolicies}
            className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 shadow-elevated press-effect text-sm font-semibold text-primary hover:bg-accent-light disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Confirm Booking"} <CheckCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  const renderConfirmationStep = () => (
    <div className="py-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
        <CheckCircle className="h-8 w-8" />
      </div>
      <h2 className="mt-6 font-serif text-3xl font-bold text-primary">
        Booking Submitted!
      </h2>
      <p className="mx-auto mt-4 max-w-md text-muted">
        Your booking has been received
        . Please send the £20 deposit to confirm.
      </p>

      <div className="mx-auto mt-8 max-w-sm rounded-lg border border-primary/10 glass-card p-6 text-left">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Service</span>
            <span className="font-medium text-primary">{selectedService?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Date</span>
            <span className="font-medium text-primary">{selectedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Time</span>
            <span className="font-medium text-primary">{selectedTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Total</span>
            <span className="font-serif font-bold text-accent-dark">
              £{finalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-sm rounded-lg border border-accent/20 bg-accent/5 p-4 text-left">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-dark">
          Deposit Payment Required
        </h3>
        <p className="mt-1 text-xs text-muted">
          Send £20 to secure your booking:
        </p>
        <div className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Bank</span>
            <span className="font-medium text-primary">Monzo</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Name</span>
            <span className="font-medium text-primary">Elizabeth Ayedebinu</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Sort Code</span>
            <span className="font-mono font-medium text-primary">04-00-03</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Account</span>
            <span className="font-mono font-medium text-primary">34563358</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Reference</span>
            <span className="font-mono font-medium text-primary">Hair</span>
          </div>
        </div>
      </div>

      {emailWarnings.length > 0 && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-left">
          <p className="text-sm font-medium text-red-700">Email Notice</p>
          {emailWarnings.map((w, i) => (
            <p key={i} className="mt-1 text-xs text-red-600">{w}</p>
          ))}
          <p className="mt-2 text-xs text-red-600">
            Your booking is saved, but please contact us to confirm. See the Contact page for details.
          </p>
        </div>
      )}

      {bookingId && (
        <p className="mt-4 text-xs text-muted">Booking reference: #{bookingId.slice(0, 8)}</p>
      )}

      <div className="mt-6 rounded-lg border border-primary/10 glass-card p-4 text-center">
        <p className="text-sm font-medium text-primary">Questions? Contact us</p>
        <div className="mt-2 flex items-center justify-center gap-4 text-xs">
          <a href="mailto:Iretomiwaelizabeth474@gmail.com" className="text-accent-dark hover:underline">
            Iretomiwaelizabeth474@gmail.com
          </a>
          <span className="text-muted">|</span>
          <a href="https://wa.link/wycx8l" target="_blank" rel="noopener noreferrer" className="text-accent-dark hover:underline">
            WhatsApp
          </a>
        </div>
      </div>

      <button
        onClick={() => {
          setStep("service")
          setSelectedService(null)
          setSelectedCategory("")
          setSelectedDate("")
          setSelectedTime("")
          setFormData({
            name: "",
            email: "",
            phone: "",
            hairLength: "",
            hairType: "",
            notes: "",
            isStudent: false,
          })
          setEmailWarnings([])
        }}
        className="mt-8 rounded-xl bg-primary px-6 py-3 shadow-elevated press-effect text-sm font-medium text-white hover:bg-primary-light"
      >
        Book Another Appointment
      </button>
    </div>
  )

  return (
    <div className="relative min-h-[90vh] bg-background pb-20">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      
      <section className="border-b border-primary/10 bg-white/40 backdrop-blur-md py-12 relative z-10 pt-32">
        <div className="container-section text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            Book an Appointment
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-primary/70">
            Complete the steps below to book your hairstyle
          </p>
        </div>
      </section>

      <div className="container-section py-12 relative z-10">
        <div className="mx-auto max-w-2xl glass-card p-6 sm:p-10">
          {step !== "confirmation" && renderProgress()}

          <div ref={stepContainerRef}>
            {step === "service" && renderServiceStep()}
            {step === "datetime" && renderDateTimeStep()}
            {step === "details" && renderDetailsStep()}
            {step === "payment" && renderPaymentStep()}
            {step === "confirmation" && renderConfirmationStep()}
          </div>
        </div>
      </div>
    </div>
  )
}
