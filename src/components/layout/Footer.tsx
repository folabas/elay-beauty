import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-white">
      <div className="container-section grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-serif text-lg font-semibold">
            EL.AY<span className="text-accent">_</span>beauty
          </h3>
          <p className="mt-2 text-sm text-white/70">
            Professional hair braiding and styling services.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-accent">
            Quick Links
          </h4>
          <ul className="mt-4 space-y-2">
            {[
              { href: "/services", label: "Services & Pricing" },
              { href: "/booking", label: "Book Appointment" },
              { href: "/policies", label: "Policies" },
              { href: "/contact", label: "Contact" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-white/70 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-accent">
            Hours
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>Friday: 5:00 PM – Next Morning</li>
            <li>Saturday: 7:00 AM – 12:00 PM</li>
            <li>Sunday: 3:00 PM – 5:00 PM</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-accent">
            Payment
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>Monzo Bank</li>
            <li>Elizabeth Ayedebinu</li>
            <li>Sort Code: 04-00-03</li>
            <li>Account: 34563358</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <div className="container-section flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} EL.AY Beauty. All rights reserved.
          </p>
          <p className="text-xs text-white/50">
            Student discount: 20% off any braiding style
          </p>
        </div>
      </div>
    </footer>
  )
}
