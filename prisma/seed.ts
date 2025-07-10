import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@family-gnucash.local',
      name: 'Family Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create user
  const userPassword = await bcrypt.hash('spouse123', 12)
  const user = await prisma.user.upsert({
    where: { username: 'spouse' },
    update: {},
    create: {
      username: 'spouse',
      email: 'spouse@family-gnucash.local',
      name: 'Spouse',
      password: userPassword,
      role: 'USER',
    },
  })

  // Create readonly user
  const readonlyPassword = await bcrypt.hash('teen123', 12)
  const readonly = await prisma.user.upsert({
    where: { username: 'teen' },
    update: {},
    create: {
      username: 'teen',
      email: 'teen@family-gnucash.local',
      name: 'Teen',
      password: readonlyPassword,
      role: 'READONLY',
    },
  })

  // Create default accounts for admin
  const defaultAccounts = [
    { name: 'Checking Account', type: 'ASSET', code: '1001', balance: 5420.50 },
    { name: 'Savings Account', type: 'ASSET', code: '1002', balance: 12850.00 },
    { name: 'Emergency Fund', type: 'ASSET', code: '1003', balance: 8500.00 },
    { name: 'Credit Card', type: 'LIABILITY', code: '2001', balance: -1245.30 },
    { name: 'Mortgage', type: 'LIABILITY', code: '2002', balance: -245000.00 },
    { name: 'Salary Income', type: 'INCOME', code: '4001', balance: -8500.00 },
    { name: 'Investment Income', type: 'INCOME', code: '4002', balance: -650.00 },
    { name: 'Groceries', type: 'EXPENSE', code: '5001', balance: 850.00 },
    { name: 'Utilities', type: 'EXPENSE', code: '5002', balance: 320.00 },
    { name: 'Gas', type: 'EXPENSE', code: '5003', balance: 180.00 },
    { name: 'Dining Out', type: 'EXPENSE', code: '5004', balance: 450.00 },
    { name: 'Insurance', type: 'EXPENSE', code: '5005', balance: 275.00 },
  ]

  for (const accountData of defaultAccounts) {
    await prisma.account.upsert({
      where: {
        userId_code: {
          userId: admin.id,
          code: accountData.code,
        },
      },
      update: {},
      create: {
        ...accountData,
        userId: admin.id,
      },
    })
  }

  // Create sample transactions
  const checkingAccount = await prisma.account.findFirst({
    where: { userId: admin.id, code: '1001' },
  })
  
  const salaryAccount = await prisma.account.findFirst({
    where: { userId: admin.id, code: '4001' },
  })

  const groceriesAccount = await prisma.account.findFirst({
    where: { userId: admin.id, code: '5001' },
  })

  if (checkingAccount && salaryAccount && groceriesAccount) {
    // Salary deposit transaction
    await prisma.transaction.create({
      data: {
        date: new Date('2025-07-07'),
        description: 'Salary Deposit',
        userId: admin.id,
        reconciled: true,
        splits: {
          create: [
            {
              accountId: checkingAccount.id,
              debit: 4250.00,
              credit: 0,
            },
            {
              accountId: salaryAccount.id,
              debit: 0,
              credit: 4250.00,
            },
          ],
        },
      },
    })

    // Grocery purchase transaction
    await prisma.transaction.create({
      data: {
        date: new Date('2025-07-08'),
        description: 'Grocery Store',
        userId: admin.id,
        reconciled: false,
        splits: {
          create: [
            {
              accountId: groceriesAccount.id,
              debit: 85.50,
              credit: 0,
            },
            {
              accountId: checkingAccount.id,
              debit: 0,
              credit: 85.50,
            },
          ],
        },
      },
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log('👤 Created users:')
  console.log('   - Admin: admin / admin123')
  console.log('   - User: spouse / spouse123')
  console.log('   - Read-only: teen / teen123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })