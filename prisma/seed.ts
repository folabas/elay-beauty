import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const braids = [
    { name: "Normal Braids (Bra length)", price: 70, category: "BRAIDS" },
    { name: "Normal Braids (Bom length, medium)", price: 80, category: "BRAIDS" },
    { name: "Normal Braids (Bom length, small)", price: 120, category: "BRAIDS" },
    { name: "Knotless Braids (Bra length)", price: 70, category: "BRAIDS" },
    { name: "Knotless Braids (Bom length, medium)", price: 80, category: "BRAIDS" },
    { name: "Knotless Braids (Bom length, small)", price: 120, category: "BRAIDS" },
    { name: "Short Boho Braids", price: 65, category: "BRAIDS" },
    { name: "Bom Length Boho Braids", price: 130, category: "BRAIDS" },
    { name: "Bra Length Boho Braids", price: 80, category: "BRAIDS" },
    { name: "Locs Braids", price: 90, category: "BRAIDS", description: "Depending on strand count, price could be less" },
    { name: "Kinky Twist (Medium)", price: 70, category: "BRAIDS" },
    { name: "Kinky Mini Twist", price: 99.99, category: "BRAIDS" },
    { name: "Fulani Braids", price: 80, category: "BRAIDS" },
    { name: "Fulani Braids with Sew-in", price: 70, category: "BRAIDS" },
    { name: "Tiny Shuku", price: 75, category: "BRAIDS" },
    { name: "Lemonade Short Braids", price: 70, category: "BRAIDS" },
    { name: "Lemonade Long Braids", price: 90, category: "BRAIDS" },
    { name: "Alicia Keys Braids (Short Length)", price: 35, category: "BRAIDS" },
    { name: "Alicia Keys Braids", price: 50, category: "BRAIDS" },
    { name: "All Back Fathia Style", price: 40, category: "BRAIDS" },
    { name: "Long Braids (Bom length with curls at end)", price: 80, category: "BRAIDS" },
    { name: "Short Braids with Curls (Shoulder length)", price: 50, category: "BRAIDS" },
    { name: "Bra Length Braids with Curls", price: 60, category: "BRAIDS" },
  ]

  const natural = [
    { name: "Cornrows (Just your hair)", price: 20, category: "NATURAL" },
    { name: "Small Twist with Natural Hair", price: 40, category: "NATURAL" },
    { name: "Normal Sized Twist with Natural Hair", price: 30, category: "NATURAL" },
    { name: "Crotchet", price: 40, category: "NATURAL" },
  ]

  const children = [
    { name: "Children Weave Style (1 child)", price: 30, category: "CHILDREN" },
    { name: "Two Children", price: 50, category: "CHILDREN" },
    { name: "Three Children", price: 70, category: "CHILDREN" },
    { name: "Four Children", price: 90, category: "CHILDREN" },
  ]

  const allServices = [...braids, ...natural, ...children]

  for (const service of allServices) {
    await prisma.service.create({ data: service as any })
  }

  // Create admin user
  await prisma.user.create({
    data: {
      name: "Elizabeth Ayedebinu",
      email: "elizabeth@elaybeauty.com",
      role: "ADMIN",
    },
  })

  console.log(`Seeded ${allServices.length} services and 1 admin user`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
