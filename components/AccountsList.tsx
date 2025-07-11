'use client'

import { formatCurrency } from '@/lib/utils'
import { Wallet, CreditCard, TrendingUp, DollarSign, Building } from 'lucide-react'

interface Account {
  id: string
  name: string
  type: string
  balance: number
  code?: string
  reconciled: boolean
}

interface Props {
  groupedAccounts: Record<string, Account[]>
  userRole: string
}

export function AccountsList({ groupedAccounts, userRole }: Props) {
  const getAccountIcon = (type: string) => {
    switch(type) {
      case 'ASSET': return <Wallet className="w-4 h-4 text-green-600" />
      case 'LIABILITY': return <CreditCard className="w-4 h-4 text-red-600" />
      case 'INCOME': return <TrendingUp className="w-4 h-4 text-blue-600" />
      case 'EXPENSE': return <DollarSign className="w-4 h-4 text-orange-600" />
      case 'EQUITY': return <Building className="w-4 h-4 text-purple-600" />
      default: return <Wallet className="w-4 h-4" />
    }
  }

  const accountTypes = ['ASSET', 'LIABILITY', 'INCOME', 'EXPENSE', 'EQUITY']

  return (
    <div className="space-y-6">
      {accountTypes.map(type => {
        const accounts = groupedAccounts[type] || []
        if (accounts.length === 0) return null

        return (
          <div key={type} className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              {getAccountIcon(type)}
              {type} Accounts
            </h3>
            <div className="space-y-2">
              {accounts.map(account => (
                <div key={account.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{account.name}</span>
                    {account.code && (
                      <span className="text-sm text-gray-500">({account.code})</span>
                    )}
                    <div className={`w-2 h-2 rounded-full ${
                      account.reconciled ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                  </div>
                  <span className={`font-semibold ${
                    account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(account.balance)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

//