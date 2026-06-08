import { Mail, Phone, MapPin, Building, CreditCard, Clock } from "lucide-react"

const paymentDetails = {
  bank: "Monzo",
  name: "Elizabeth Ayedebinu",
  sortCode: "04-00-03",
  accountNumber: "34563358",
  description: "Hair",
}

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-border bg-card py-16">
        <div className="container-section text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            Contact & Payment
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Get in touch or send your deposit to secure your booking
          </p>
        </div>
      </section>

      <div className="container-section py-16">
        <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-primary">
              Get in Touch
            </h2>
            <p className="text-muted">
              Have a question about a style or need help choosing? Send us a
              message before booking.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">Email</p>
                  <a
                    href="mailto:elizabeth@elaybeauty.com"
                    className="text-sm text-muted transition-colors hover:text-accent"
                  >
                    elizabeth@elaybeauty.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">Location</p>
                  <p className="text-sm text-muted">London, UK</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">Available Hours</p>
                  <div className="mt-1 space-y-0.5 text-sm text-muted">
                    <p>Friday: 5:00 PM – Next Morning</p>
                    <p>Saturday: 7:00 AM – 12:00 PM</p>
                    <p>Sunday: 3:00 PM – 5:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-primary">
              Deposit Payment
            </h2>
            <p className="text-muted">
              A £20 deposit is required on all bookings. Send your
              deposit to the account below:
            </p>

            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">
                    {paymentDetails.bank}
                  </p>
                  <p className="text-xs text-muted">Bank Transfer</p>
                </div>
              </div>

              <div className="mt-4 space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Account Name</span>
                  <span className="font-medium text-primary">
                    {paymentDetails.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Sort Code</span>
                  <span className="font-mono font-medium text-primary">
                    {paymentDetails.sortCode}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Account Number</span>
                  <span className="font-mono font-medium text-primary">
                    {paymentDetails.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Reference</span>
                  <span className="font-medium text-primary">
                    {paymentDetails.description}
                  </span>
                </div>
              </div>
            </div>

            <p className="rounded-lg bg-accent/5 p-3 text-xs text-muted">
              After sending your deposit, your booking will be confirmed. Please
              use the reference Hair so we can identify your payment.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
