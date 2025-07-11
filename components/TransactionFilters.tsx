'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter } from 'lucide-react'

interface Account {
  id: string
  name: string
}

interface Props {
  accounts: Account[]
  currentMonth?: string
  currentAccount?: string
  currentSearch?: string
}

export function TransactionFilters({ accounts, currentMonth, currentAccount, currentSearch }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/transactions?${params.toString()}`)
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Month</label>
          <input
            type="month"
            value={currentMonth || ''}
            onChange={(e) => updateFilters('month', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Account</label>
          <select
            value={currentAccount || ''}
            onChange={(e) => updateFilters('account', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">All Accounts</option>
            {accounts.map(account => (
              <option key={account.id} value={account.name}>{account.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={currentSearch || ''}
              onChange={(e) => updateFilters('search', e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-10 pr-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

//