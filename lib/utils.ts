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