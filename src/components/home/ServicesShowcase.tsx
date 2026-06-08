import Link from "next/link"
import { Sparkles, Heart, Baby } from "lucide-react"

const categories = [
  {
    title: "Braids",
    icon: Sparkles,
    description: "From classic box braids to boho styles",
    count: "23+ styles",
    href: "/services#braids",
  },
  {
    title: "Natural Hair",
    icon: Heart,
    description: "Cornrows, twists, and crotchet styles",
    count: "4 styles",
    href: "/services#natural",
  },
  {
    title: "Children",
    icon: Baby,
    description: "Weaves and styles for little ones",
    count: "4 options",
    href: "/services#children",
  },
]

export default function ServicesShowcase() {
  return (
    <section className="py-20">
      <div className="container-section">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Our Services
          </h2>
          <p className="mt-4 text-muted">
            Browse our range of professional braiding and styling services
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link
                key={category.title}
                href={category.href}
                className="group rounded-xl border border-border bg-card p-8 shadow-soft transition-all hover:shadow-elevated hover:-translate-y-0.5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 font-serif text-xl font-semibold text-primary">
                  {category.title}
                </h3>
                <p className="mt-2 text-sm text-muted">{category.description}</p>
                <p className="mt-4 text-xs font-medium uppercase tracking-wider text-accent">
                  {category.count}
                </p>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/services"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-primary px-8 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white"
          >
            View Full Price List
          </Link>
        </div>
      </div>
    </section>
  )
}
