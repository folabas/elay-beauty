import { Search, Calendar, CreditCard, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Choose Your Style",
    description: "Browse our services and pick the perfect hairstyle for you.",
  },
  {
    icon: Calendar,
    title: "Pick a Date & Time",
    description: "Select from available slots that work for your schedule.",
  },
  {
    icon: CreditCard,
    title: "Secure With Deposit",
    description: "Pay a £20 deposit to confirm your booking.",
  },
  {
    icon: CheckCircle,
    title: "Get Confirmation",
    description: "Receive an email confirmation with all your booking details.",
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-card py-20">
      <div className="container-section">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-muted">
            Booking your appointment is simple and takes just a few minutes
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.title} className="relative text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Icon className="h-7 w-7" />
                </div>
                <div className="mt-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                    Step {index + 1}
                  </span>
                  <h3 className="mt-1 font-serif text-lg font-semibold text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
