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