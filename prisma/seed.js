const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const PRICE_LIST = {
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
}

async function main() {
  for (const [category, services] of Object.entries(PRICE_LIST)) {
    for (const service of services) {
      const existing = await prisma.service.findFirst({
        where: { name: service.name, category: category },
      })
      if (existing) {
        await prisma.service.update({
          where: { id: existing.id },
          data: { price: service.price },
        })
      } else {
        await prisma.service.create({
          data: {
            name: service.name,
            category: category,
            price: service.price,
            description: service.note || null,
          },
        })
      }
    }
  }
  console.log("Services seeded successfully")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
