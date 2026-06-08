import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-light to-primary py-24 sm:py-32">
      <div className="container-section relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Expert Braiding.
            <br />
            <span className="text-accent">Effortless Booking.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">
            Book professional hair braiding and styling appointments with EL.AY
            Beauty. Specialising in braids, natural hair, and childrens styles.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/booking"
              className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-accent px-8 text-sm font-semibold text-primary shadow-sm transition-all hover:bg-accent-light sm:w-auto"
            >
              Book Your Appointment
            </Link>
            <Link
              href="/services"
              className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-white/20 px-8 text-sm font-semibold text-white transition-all hover:bg-white/10 sm:w-auto"
            >
              View Services & Pricing
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/60">
            Student discount: 20% off any braiding style
          </p>
        </div>
      </div>
    </section>
  )
}
