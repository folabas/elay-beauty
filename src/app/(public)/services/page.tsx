import { PRICE_LIST, SERVICE_CATEGORIES, SERVICE_IMAGES } from "@/types"
import { Sparkles, Heart, Baby, GraduationCap } from "lucide-react"

const categoryIcons = {
  BRAIDS: Sparkles,
  NATURAL: Heart,
  CHILDREN: Baby,
}

const categoryDescriptions = {
  BRAIDS: "Professional braiding services for all lengths and styles",
  NATURAL: "Styling for your natural hair with care and precision",
  CHILDREN: "Gentle and stylish options for children of all ages",
}

function PriceCard({
  name,
  price,
  note,
}: {
  name: string
  price: number
  note?: string
}) {
  const imgSrc = SERVICE_IMAGES[name]
  return (
    <div className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-soft transition-all hover:border-accent/30 hover:shadow-card">
      <div className="flex items-center gap-4">
        {imgSrc && (
          <img
            src={imgSrc}
            alt={name}
            className="h-16 w-16 shrink-0 rounded-lg object-cover"
          />
        )}
        <div>
          <p className="font-medium text-primary">{name}</p>
          {note && <p className="mt-0.5 text-xs text-muted">{note}</p>}
        </div>
      </div>
      <span className="whitespace-nowrap font-serif text-lg font-bold text-accent-dark">
        £{price}
      </span>
    </div>
  )
}

export default function ServicesPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-primary via-primary-light to-primary py-16">
        <div className="container-section text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Services & Pricing
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Transparent pricing with no hidden costs. Student discount available.
          </p>
        </div>
      </section>

      <div className="container-section py-12">
        <div className="mb-8 flex items-center gap-2 rounded-lg bg-accent/5 px-4 py-3 text-sm text-accent-dark">
          <GraduationCap className="h-4 w-4" />
          <span>
            <strong>Student Discount:</strong> 20% off any braiding style. Valid
            student ID required at appointment.
          </span>
        </div>

        <div className="space-y-16">
          {(Object.entries(PRICE_LIST) as [keyof typeof PRICE_LIST, typeof PRICE_LIST[keyof typeof PRICE_LIST]][]).map(
            ([category, services]) => {
              const Icon = categoryIcons[category]
              return (
                <section key={category} id={category.toLowerCase()}>
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-primary">
                        {SERVICE_CATEGORIES[category]}
                      </h2>
                      <p className="text-sm text-muted">
                        {categoryDescriptions[category]}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {services.map((service) => (
                      <PriceCard
                        key={service.name}
                        name={service.name}
                        price={service.price}
                        note={"note" in service ? (service as { name: string; price: number; note: string }).note : undefined}
                      />
                    ))}
                  </div>
                </section>
              )
            }
          )}
        </div>
      </div>
    </>
  )
}
