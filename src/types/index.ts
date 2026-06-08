export interface ServiceWithCategory {
  id: string
  name: string
  category: "BRAIDS" | "NATURAL" | "CHILDREN"
  description: string | null
  price: number
  requiresHairInfo: boolean
  duration: number | null
  isActive: boolean
}

export interface BookingFormData {
  clientName: string
  email: string
  phone: string
  serviceId: string
  date: Date
  time: string
  hairLength?: string
  hairType?: string
  notes?: string
  isStudent: boolean
}

export interface TimeSlot {
  time: string
  available: boolean
}

export interface AvailabilityDay {
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

export const SERVICE_CATEGORIES = {
  BRAIDS: "Braids",
  NATURAL: "Natural Hair Styles",
  CHILDREN: "Children's Styles",
} as const

export const PRICE_LIST = {
  BRAIDS: [
    { name: "Normal Braids (Bra length)", price: 70 },
    { name: "Normal Braids (Bom length, medium)", price: 80 },
    { name: "Normal Braids (Bom length, small)", price: 120 },
    { name: "Knotless Braids (Bra length)", price: 70 },
    { name: "Knotless Braids (Bom length, medium)", price: 80 },
    { name: "Knotless Braids (Bom length, small)", price: 120 },
    { name: "Short Boho Braids", price: 65 },
    { name: "Bom Length Boho Braids", price: 130 },
    { name: "Bra Length Boho Braids", price: 80 },
    { name: "Locs Braids", price: 90, note: "Depending on strand count" },
    { name: "Kinky Twist (Medium)", price: 70 },
    { name: "Kinky Mini Twist", price: 99.99 },
    { name: "Fulani Braids", price: 80 },
    { name: "Fulani Braids with Sew-in", price: 70 },
    { name: "Tiny Shuku", price: 75 },
    { name: "Lemonade Short Braids", price: 70 },
    { name: "Lemonade Long Braids", price: 90 },
    { name: "Alicia Keys Braids (Short Length)", price: 35 },
    { name: "Alicia Keys Braids", price: 50 },
    { name: "All Back Fathia Style", price: 40 },
    { name: "Long Braids (Bom length with curls)", price: 80 },
    { name: "Short Braids with Curls (Shoulder length)", price: 50 },
    { name: "Bra Length Braids with Curls", price: 60 },
  ],
  NATURAL: [
    { name: "Cornrows (Just your hair)", price: 20 },
    { name: "Small Twist with Natural Hair", price: 40 },
    { name: "Normal Sized Twist with Natural Hair", price: 30 },
    { name: "Crotchet", price: 40 },
  ],
  CHILDREN: [
    { name: "Children Weave Style (1 child)", price: 30 },
    { name: "Two Children", price: 50 },
    { name: "Three Children", price: 70 },
    { name: "Four Children", price: 90 },
  ],
} as const

export const AVAILABILITY_SCHEDULE = [
  { day: "Friday", start: "17:00", end: "24:00", note: "Long braids may finish late or require overnight stay" },
  { day: "Saturday", start: "07:00", end: "12:00", note: "Last booking at 8:00 AM. Long braids not available on Saturdays." },
  { day: "Sunday", start: "15:00", end: "17:00", note: "Only Cornrows and Crotchet available on Sundays." },
]
