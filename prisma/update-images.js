const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

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

async function main() {
  let updated = 0
  for (const [name, imageUrl] of Object.entries(imageMap)) {
    const service = await prisma.service.findFirst({ where: { name } })
    if (service) {
      await prisma.service.update({
        where: { id: service.id },
        data: { imageUrl },
      })
      updated++
      console.log(`  ✓ ${name}`)
    } else {
      console.log(`  ✗ Not found: ${name}`)
    }
  }
  console.log(`\nUpdated ${updated} services with image URLs`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
