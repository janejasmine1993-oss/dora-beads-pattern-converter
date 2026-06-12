import { prisma } from '../services/db'

async function checkDatabase() {
  try {
    const userCount = await prisma.user.count()
    console.log('✅ Database connected')
    console.log(`Users count: ${userCount}`)
    console.log('✅ All checks passed')
  } catch (err) {
    console.error('❌ Database connection failed:', err instanceof Error ? err.message : String(err))
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
