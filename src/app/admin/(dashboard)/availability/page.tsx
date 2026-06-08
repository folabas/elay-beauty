import AvailabilityEditor from "@/components/admin/AvailabilityEditor"

export default function AdminAvailabilityPage() {
  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-serif text-xl font-bold text-primary">Availability</h1>

      <div className="mt-6 mx-auto max-w-2xl">
        <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
          <AvailabilityEditor />
        </div>
      </div>
    </div>
  )
}
