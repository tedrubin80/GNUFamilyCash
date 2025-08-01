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
  const canEdit = userRole === 'ADMIN' || userRole === 'USER'

  if (transactions.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border text-center text-gray-500">
        No transactions found
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-4">Date</th>
            <th className="text-left p-4">Description</th>
            <th className="text-left p-4">Account</th>
            <th className="text-right p-4">Amount</th>
            <th className="text-center p-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const primarySplit = transaction.splits[0]
            const amount = primarySplit?.debit || primarySplit?.credit || 0
            const isDebit = primarySplit?.debit > 0

            return (
              <tr key={transaction.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{formatDate(transaction.date)}</td>
                <td className="p-4 font-medium">{transaction.description}</td>
                <td className="p-4">{primarySplit?.account.name}</td>
                <td className={`p-4 text-right font-medium ${
                  isDebit ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isDebit ? '+' : '-'}{formatCurrency(Number(amount))}
                </td>
                <td className="p-4 text-center">
                  {transaction.reconciled ? (
                    <CheckSquare className="w-4 h-4 text-green-600 mx-auto" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400 mx-auto" />
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}