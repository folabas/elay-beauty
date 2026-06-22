import AvailabilityEditor from "@/components/admin/AvailabilityEditor"

export default function AdminAvailabilityPage() {
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto pb-32">
      <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-primary mb-8">
        Availability<span className="text-accent">.</span>
      </h1>

      <div className="mt-8 mx-auto max-w-2xl">
        <div className="glass-card border border-primary/10 rounded-[32px] p-6 sm:p-8 shadow-elevated overflow-x-auto">
          <AvailabilityEditor />
        </div>
      </div>
    </div>
  )
}
