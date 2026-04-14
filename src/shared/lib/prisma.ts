import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Inicialización explícita del datasource para que funcione
// tanto en local (.env.local) como en Vercel (env vars del dashboard)
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: process.env.DATABASE_URL },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
