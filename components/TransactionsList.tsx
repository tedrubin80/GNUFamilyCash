'use client'

import { formatCurrency, formatDate } from '@/lib/utils'
import { CheckSquare, Square } from 'lucide-react'

interface TransactionSplit {
  debit: number
  credit: number
  account: {
    name: string
  }
}

interface Transaction {
  id: string
  date: string
  description: string
  reconciled: boolean
  splits: TransactionSplit[]
}

interface Props {
  transactions: Transaction[]
  userRole: string
}

export function TransactionsList({ transactions, userRole }: Props) {
  const canEdit = userRole