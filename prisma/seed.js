const { PrismaClient } = require("@prisma/client")
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

  // Image mapping: variations of same style share an image
  const imageMap = {
    "Normal Braids (Bra length)": "/images/services/service-01.jpg",
    "Normal Braids (Bom length, medium)": "/images/services/service-01.jpg",
    "Normal Braids (Bom length, small)": "/images/services/service-01.jpg",
    "Knotless Braids (Bra length)": "/images/services/service-02.jpg",
    "Knotless Braids (Bom length, medium)": "/images/services/service-02.jpg",
    "Knotless Braids (Bom length, small)": "/images/services/service-02.jpg",
    "Short Boho Braids": "/images/services/service-17.jpg",
    "Bom Length Boho Braids": "/images/services/service-17.jpg",
    "Bra Length Boho Braids": "/images/services/service-17.jpg",
    "Locs Braids": "/images/services/service-16.jpg",
    "Kinky Twist (Medium)": "/images/services/service-06.jpg",
    "Kinky Mini Twist": "/images/services/service-06.jpg",
    "Fulani Braids": "/images/services/service-15.jpg",
    "Fulani Braids with Sew-in": "/images/services/service-15.jpg",
    "Tiny Shuku": "/images/services/service-13.jpg",
    "Lemonade Short Braids": "/images/services/service-14.jpg",
    "Lemonade Long Braids": "/images/services/service-14.jpg",
    "Alicia Keys Braids (Short Length)": "/images/services/service-03.jpg",
    "Alicia Keys Braids": "/images/services/service-03.jpg",
    "All Back Fathia Style": "/images/services/service-04.jpg",
    "Long Braids (Bom length with curls at end)": "/images/services/service-05.jpg",
    "Short Braids with Curls (Shoulder length)": "/images/services/service-05.jpg",
    "Bra Length Braids with Curls": "/images/services/service-05.jpg",
    "Cornrows (Just your hair)": "/images/services/service-07.jpg",
    "Small Twist with Natural Hair": "/images/services/service-08.jpg",
    "Normal Sized Twist with Natural Hair": "/images/services/service-08.jpg",
    "Crotchet": "/images/services/service-18.jpg",
    "Children Weave Style (1 child)": "/images/services/service-12.jpg",
    "Two Children": "/images/services/service-12.jpg",
    "Three Children": "/images/services/service-12.jpg",
    "Four Children": "/images/services/service-12.jpg",
  }

  for (const service of allServices) {
    await prisma.service.create({
      data: { ...service, imageUrl: imageMap[service.name] || null },
    })
  }

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
