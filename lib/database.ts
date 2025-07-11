import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database utility functions
export async function createDefaultAccounts(userId: string) {
  const defaultAccounts = [
    { name: 'Checking Account', type: 'ASSET', code: '1001' },
    { name: 'Savings Account', type: 'ASSET', code: '1002' },
    { name: 'Credit Card', type: 'LIABILITY', code: '2001' },
    { name: 'Salary Income', type: 'INCOME', code: '4001' },
    { name: 'Groceries', type: 'EXPENSE', code: '5001' },
    { name: 'Utilities', type: 'EXPENSE', code: '5002' },
    { name: 'Transportation', type: 'EXPENSE', code: '5003' },
  ]

  for (const account of defaultAccounts) {
    await prisma.account.create({
      data: {
        ...account,
        userId,
      },
    })
  }
}

export async function getUserAccounts(userId: string) {
  return prisma.account.findMany({
    where: { userId },
    orderBy: [{ type: 'asc' }, { code: 'asc' }],
  })
}

export async function getUserTransactions(userId: string, month?: string) {
  const where: any = { userId }
  
  if (month) {
    const startDate = new Date(`${month}-01`)
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
    where.date = {
      gte: startDate,
      lte: endDate,
    }
  }

  return prisma.transaction.findMany({
    where,
    include: {
      splits: {
        include: {
          account: true,
        },
      },
    },
    orderBy: { date: 'desc' },
  })
}

//