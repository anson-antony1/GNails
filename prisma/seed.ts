import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.DIRECT_DATABASE_URL,
})
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
})

async function main() {
  console.log('🌱 Starting seed...')

  const services = [
    {
      id: 'classic-manicure',
      name: 'Classic Manicure',
      category: 'manicure',
      basePrice: 35,
      durationMinutes: 30,
      isActive: true,
    },
    {
      id: 'gel-manicure',
      name: 'Gel Manicure',
      category: 'manicure',
      basePrice: 45,
      durationMinutes: 45,
      isActive: true,
    },
    {
      id: 'spa-pedicure',
      name: 'Spa Pedicure',
      category: 'pedicure',
      basePrice: 55,
      durationMinutes: 60,
      isActive: true,
    },
    {
      id: 'deluxe-pedicure',
      name: 'Deluxe Pedicure',
      category: 'pedicure',
      basePrice: 75,
      durationMinutes: 75,
      isActive: true,
    },
    {
      id: 'gel-x-full-set',
      name: 'Gel-X Full Set',
      category: 'nails',
      basePrice: 85,
      durationMinutes: 90,
      isActive: true,
    },
    {
      id: 'dip-powder-manicure',
      name: 'Dip Powder Manicure',
      category: 'nails',
      basePrice: 50,
      durationMinutes: 60,
      isActive: true,
    },
  ]

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: service,
      create: service,
    })
    console.log(`✓ Upserted service: ${service.name}`)
  }

  const count = await prisma.service.count()
  console.log(`\n✨ Seed complete! Total services in database: ${count}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
