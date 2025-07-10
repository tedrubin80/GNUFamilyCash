// File Locations:
// ./lib/database.ts
// ./lib/google-drive.ts
// ./lib/utils.ts
// ./types/index.ts

// === ./lib/database.ts ===
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

// === ./lib/google-drive.ts ===
import { google } from 'googleapis'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'http://localhost:3000'
)

oauth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN,
})

const drive = google.drive({ version: 'v3', auth: oauth2Client })

export async function uploadToGoogleDrive(
  filename: string,
  content: string,
  mimeType: string = 'application/json'
) {
  try {
    const fileMetadata = {
      name: filename,
      parents: ['your-folder-id'], // Create a folder in Google Drive and put its ID here
    }

    const media = {
      mimeType,
      body: content,
    }

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    })

    return response.data.id
  } catch (error) {
    console.error('Error uploading to Google Drive:', error)
    throw error
  }
}

export async function downloadFromGoogleDrive(fileId: string) {
  try {
    const response = await drive.files.get({
      fileId,
      alt: 'media',
    })

    return response.data
  } catch (error) {
    console.error('Error downloading from Google Drive:', error)
    throw error
  }
}

export async function listGoogleDriveBackups() {
  try {
    const response = await drive.files.list({
      q: "parents in 'your-folder-id' and name contains 'family-accounting-backup'",
      fields: 'files(id, name, createdTime, size)',
      orderBy: 'createdTime desc',
    })

    return response.data.files
  } catch (error) {
    console.error('Error listing Google Drive backups:', error)
    throw error
  }
}

export async function createBackup(userId: string) {
  try {
    // Get all user data
    const [accounts, transactions, budgets] = await Promise.all([
      prisma.account.findMany({ where: { userId } }),
      prisma.transaction.findMany({
        where: { userId },
        include: { splits: true },
      }),
      prisma.budget.findMany({
        where: { userId },
        include: { items: true },
      }),
    ])

    const backupData = {
      timestamp: new Date().toISOString(),
      userId,
      accounts,
      transactions,
      budgets,
    }

    const filename = `family-accounting-backup-${new Date().toISOString().split('T')[0]}.json`
    const content = JSON.stringify(backupData, null, 2)

    const fileId = await uploadToGoogleDrive(filename, content)
    return { fileId, filename }
  } catch (error) {
    console.error('Error creating backup:', error)
    throw error
  }
}

// === ./lib/utils.ts ===
import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(Math.abs(amount))
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function calculateAccountBalance(accountId: string, splits: any[]) {
  return splits
    .filter(split => split.accountId === accountId)
    .reduce((balance, split) => {
      return balance + (split.debit || 0) - (split.credit || 0)
    }, 0)
}

export function validateTransaction(splits: any[]) {
  const totalDebits = splits.reduce((sum, split) => sum + (split.debit || 0), 0)
  const totalCredits = splits.reduce((sum, split) => sum + (split.credit || 0), 0)
  
  return Math.abs(totalDebits - totalCredits) < 0.01
}

export function generateAccountCode(type: string, existingCodes: string[]) {
  const typePrefixes = {
    ASSET: '1',
    LIABILITY: '2',
    EQUITY: '3',
    INCOME: '4',
    EXPENSE: '5',
  }
  
  const prefix = typePrefixes[type as keyof typeof typePrefixes] || '9'
  let counter = 1
  
  while (existingCodes.includes(`${prefix}${counter.toString().padStart(3, '0')}`)) {
    counter++
  }
  
  return `${prefix}${counter.toString().padStart(3, '0')}`
}

// === ./types/index.ts ===
import { User, Account, Transaction, TransactionSplit, Budget, BudgetItem } from '@prisma/client'

export type UserRole = 'ADMIN' | 'USER' | 'READONLY'
export type AccountType = 'ASSET' | 'LIABILITY' | 'INCOME' | 'EXPENSE' | 'EQUITY'

export interface UserWithRelations extends User {
  accounts?: Account[]
  transactions?: TransactionWithSplits[]
  budgets?: BudgetWithItems[]
}

export interface AccountWithRelations extends Account {
  user?: User
  parent?: Account
  children?: Account[]
  splits?: TransactionSplit[]
  budgetItems?: BudgetItem[]
}

export interface TransactionWithSplits extends Transaction {
  user?: User
  splits: (TransactionSplit & {
    account: Account
  })[]
}

export interface BudgetWithItems extends Budget {
  user?: User
  items: (BudgetItem & {
    account: Account
  })[]
}

export interface CreateTransactionData {
  date: Date
  description: string
  splits: {
    accountId: string
    debit?: number
    credit?: number
  }[]
}

export interface CreateAccountData {
  name: string
  type: AccountType
  code?: string
  parentId?: string
}

export interface CreateBudgetData {
  name: string
  period: string
  items: {
    accountId: string
    budgeted: number
  }[]
}

export interface FinancialReport {
  assets: number
  liabilities: number
  income: number
  expenses: number
  equity: number
  netWorth: number
  netIncome: number
}

export interface MonthlyReport extends FinancialReport {
  period: string
  accountBalances: {
    [accountType: string]: {
      [accountId: string]: {
        name: string
        balance: number
      }
    }
  }
}