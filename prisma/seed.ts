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
      email: 'admin@family-gnucash.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN'
    }
  })
  console.log('✅ Admin user created')

  // Create regular user
  const userPassword = await bcrypt.hash('spouse123', 12)
  const regularUser = await prisma.user.upsert({
    where: { username: 'spouse' },
    update: {},
    create: {
      username: 'spouse',
      email: 'spouse@family-gnucash.com',
      name: 'Family Member',
      password: userPassword,
      role: 'USER'
    }
  })
  console.log('✅ Regular user created')

  // Create read-only user
  const readOnlyPassword = await bcrypt.hash('teen123', 12)
  const readOnlyUser = await prisma.user.upsert({
    where: { username: 'teen' },
    update: {},
    create: {
      username: 'teen',
      email: 'teen@family-gnucash.com',
      name: 'Teen User',
      password: readOnlyPassword,
      role: 'READONLY'
    }
  })
  console.log('✅ Read-only user created')

  // Create default accounts for admin
  const defaultAccounts = [
    { name: 'Checking Account', type: 'ASSET', code: '1001', balance: 5000 },
    { name: 'Savings Account', type: 'ASSET', code: '1002', balance: 10000 },
    { name: 'Credit Card', type: 'LIABILITY', code: '2001', balance: -1500 },
    { name: 'Salary Income', type: 'INCOME', code: '4001', balance: 0 },
    { name: 'Groceries', type: 'EXPENSE', code: '5001', balance: 0 },
    { name: 'Utilities', type: 'EXPENSE', code: '5002', balance: 0 },
    { name: 'Transportation', type: 'EXPENSE', code: '5003', balance: 0 },
    { name: 'Entertainment', type: 'EXPENSE', code: '5004', balance: 0 },
    { name: 'Healthcare', type: 'EXPENSE', code: '5005', balance: 0 },
    { name: 'Opening Balance', type: 'EQUITY', code: '3001', balance: 0 }
  ]

  for (const accountData of defaultAccounts) {
    await prisma.account.upsert({
      where: { 
        code: accountData.code 
      },
      update: {},
      create: {
        ...accountData,
        userId: admin.id
      }
    })
  }
  console.log('✅ Default accounts created')

  // Create sample transactions
  const checking = await prisma.account.findFirst({ where: { code: '1001', userId: admin.id } })
  const salary = await prisma.account.findFirst({ where: { code: '4001', userId: admin.id } })
  const groceries = await prisma.account.findFirst({ where: { code: '5001', userId: admin.id } })
  const utilities = await prisma.account.findFirst({ where: { code: '5002', userId: admin.id } })

  if (checking && salary && groceries && utilities) {
    // Salary deposit
    await prisma.transaction.create({
      data: {
        date: new Date('2025-01-01'),
        description: 'Monthly Salary',
        userId: admin.id,
        splits: {
          create: [
            { accountId: checking.id, debit: 5000, credit: 0 },
            { accountId: salary.id, debit: 0, credit: 5000 }
          ]
        }
      }
    })

    // Grocery expense
    await prisma.transaction.create({
      data: {
        date: new Date('2025-01-05'),
        description: 'Weekly Groceries',
        userId: admin.id,
        splits: {
          create: [
            { accountId: groceries.id, debit: 250, credit: 0 },
            { accountId: checking.id, debit: 0, credit: 250 }
          ]
        }
      }
    })

    // Utility payment
    await prisma.transaction.create({
      data: {
        date: new Date('2025-01-10'),
        description: 'Electric Bill',
        userId: admin.id,
        splits: {
          create: [
            { accountId: utilities.id, debit: 150, credit: 0 },
            { accountId: checking.id, debit: 0, credit: 150 }
          ]
        }
      }
    })

    console.log('✅ Sample transactions created')
  }

  // Create sample budget
  await prisma.budget.create({
    data: {
      name: 'January 2025 Budget',
      period: '2025-01',
      userId: admin.id,
      items: {
        create: [
          { accountId: groceries!.id, budgeted: 1000, actual: 250 },
          { accountId: utilities!.id, budgeted: 200, actual: 150 }
        ]
      }
    }
  })
  console.log('✅ Sample budget created')

  // Create sample scheduled transactions
  if (checking && groceries && salary) {
    await prisma.scheduledTransaction.create({
      data: {
        name: 'Weekly Groceries',
        description: 'Automated weekly grocery budget',
        amount: 250,
        frequency: 'WEEKLY',
        startDate: new Date('2025-01-01'),
        nextExecutionDate: new Date('2025-01-12'),
        debitAccountId: groceries.id,
        creditAccountId: checking.id,
        autoExecute: false,
        userId: admin.id
      }
    })

    await prisma.scheduledTransaction.create({
      data: {
        name: 'Monthly Salary',
        description: 'Monthly salary deposit',
        amount: 5000,
        frequency: 'MONTHLY',
        startDate: new Date('2025-01-01'),
        nextExecutionDate: new Date('2025-02-01'),
        debitAccountId: checking.id,
        creditAccountId: salary.id,
        autoExecute: true,
        userId: admin.id
      }
    })

    console.log('✅ Sample scheduled transactions created')
  }

  console.log('🎉 Database seed completed!')
  console.log('\nDemo accounts:')
  console.log('Admin: admin / admin123')
  console.log('User: spouse / spouse123')
  console.log('Read-only: teen / teen123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })