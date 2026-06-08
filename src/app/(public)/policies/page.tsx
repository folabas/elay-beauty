import { AlertTriangle, Clock, XCircle, DollarSign, Calendar, FileText } from "lucide-react"

const policies = [
  {
    icon: DollarSign,
    title: "Deposit Policy",
    items: [
      "A £20 deposit is required on all bookings to secure your appointment.",
      "Without a deposit, there is no booking.",
      "Deposits can be paid via bank transfer to Monzo (Elizabeth Ayedebinu, 04-00-03, 34563358, ref: Hair).",
    ],
  },
  {
    icon: Clock,
    title: "Late Arrival Policy",
    items: [
      "Arriving later than 15 minutes will result in the deposit serving as a late fee.",
      "Full payment will still be required.",
      "If arrival is more than 30 minutes late, the booking will be cancelled and the deposit will not be refunded.",
    ],
  },
  {
    icon: FileText,
    title: "Preparation",
    items: [
      "Ensure the correct hair material and quantity are purchased.",
      "This affects the hairstyle outcome.",
      "For assistance, contact via email before your appointment.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Pricing",
    items: [
      "Prices are fixed and non-negotiable.",
      "Discounts may be available during peak seasons (Summer and Christmas).",
      "Students receive 20% off any braiding style (valid ID required).",
    ],
  },
  {
    icon: XCircle,
    title: "Cancellation Policy",
    items: [
      "Notice must be given at least 48 hours before the appointment.",
      "Cancellations made less than 48 hours before the appointment will not receive a deposit refund.",
      "Cancellations made 48 hours or more before the appointment will receive a full deposit refund.",
    ],
  },
  {
    icon: Calendar,
    title: "Important Notes",
    items: [
      "If no listed description matches your desired hairstyle, send a message before booking.",
      "Choosing the wrong style may increase costs or cause cancellation.",
      "Clients with very short hair may incur additional costs.",
      "Changing hairstyle upon arrival may lead to increased, reduced costs, or cancellation.",
    ],
  },
]

export default function PoliciesPage() {
  return (
    <>
      <section className="border-b border-border bg-card py-16">
        <div className="container-section text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            Booking Policies
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Please read these policies carefully before booking your appointment
          </p>
        </div>
      </section>

      <div className="container-section py-16">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-6 sm:grid-cols-2">
            {policies.map((policy) => {
              const Icon = policy.icon
              return (
                <div
                  key={policy.title}
                  className="rounded-xl border border-border bg-card p-6 shadow-soft"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="font-serif text-lg font-semibold text-primary">
                      {policy.title}
                    </h2>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {policy.items.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
