// File Locations:
// ./components/AccountsList.tsx
// ./components/AddAccountForm.tsx
// ./components/TransactionsList.tsx
// ./components/AddTransactionForm.tsx
// ./components/TransactionFilters.tsx
// ./app/api/accounts/route.ts
// ./app/api/transactions/route.ts

// === ./components/AccountsList.tsx ===
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

// === ./components/AddAccountForm.tsx ===
'use client'

import { useState } from 'react'
import { Plus, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Account {
  id: string
  name: string
  type: string
}

interface Props {
  accounts: Account[]
}

export function AddAccountForm({ accounts }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'ASSET',
    code: '',
    parentId: ''
  })
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({ name: '', type: 'ASSET', code: '', parentId: '' })
        router.refresh()
      } else {
        alert('Failed to create account')
      }
    } catch (error) {
      alert('Error creating account')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
      >
        <Plus className="w-4 h-4" />
        Add Account
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Add New Account</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Account Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Account Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="ASSET">Asset</option>
              <option value="LIABILITY">Liability</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
              <option value="EQUITY">Equity</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Account Code (Optional)</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="e.g., 1001"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Parent Account (Optional)</label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">None (Top Level)</option>
              {accounts.filter(a => a.type === formData.type).map(account => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// === ./components/TransactionsList.tsx ===
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

  const toggleReconciled = async (transactionId: string) => {
    if (!canEdit) return

    try {
      await fetch(`/api/transactions/${transactionId}/reconcile`, {
        method: 'PATCH'
      })
      // Refresh page or update state
      window.location.reload()
    } catch (error) {
      alert('Error updating transaction')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-medium text-gray-900">Date</th>
              <th className="text-left p-4 font-medium text-gray-900">Description</th>
              <th className="text-left p-4 font-medium text-gray-900">Account</th>
              <th className="text-right p-4 font-medium text-gray-900">Debit</th>
              <th className="text-right p-4 font-medium text-gray-900">Credit</th>
              <th className="text-center p-4 font-medium text-gray-900">Status</th>
              {canEdit && (
                <th className="text-center p-4 font-medium text-gray-900">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {transactions.flatMap(transaction =>
              transaction.splits.map((split, index) => (
                <tr key={`${transaction.id}-${index}`} className="border-b">
                  <td className="p-4">{formatDate(transaction.date)}</td>
                  <td className="p-4 font-medium">{transaction.description}</td>
                  <td className="p-4">{split.account.name}</td>
                  <td className="p-4 text-right">
                    {split.debit > 0 ? formatCurrency(split.debit) : ''}
                  </td>
                  <td className="p-4 text-right">
                    {split.credit > 0 ? formatCurrency(split.credit) : ''}
                  </td>
                  <td className="p-4 text-center">
                    {transaction.reconciled ? (
                      <CheckSquare className="w-4 h-4 text-green-600 mx-auto" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400 mx-auto" />
                    )}
                  </td>
                  {canEdit && index === 0 && (
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleReconciled(transaction.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        {transaction.reconciled ? 'Unreconcile' : 'Reconcile'}
                      </button>
                    </td>
                  )}
                  {canEdit && index > 0 && <td className="p-4"></td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {transactions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No transactions found
        </div>
      )}
    </div>
  )
}

// === ./components/AddTransactionForm.tsx ===
'use client'

import { useState } from 'react'
import { Plus, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Account {
  id: string
  name: string
}

interface Props {
  accounts: Account[]
}

export function AddTransactionForm({ accounts }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    splits: [
      { accountId: '', debit: '', credit: '' },
      { accountId: '', debit: '', credit: '' }
    ]
  })
  
  const router = useRouter()

  const addSplit = () => {
    setFormData({
      ...formData,
      splits: [...formData.splits, { accountId: '', debit: '', credit: '' }]
    })
  }

  const updateSplit = (index: number, field: string, value: string) => {
    const updatedSplits = [...formData.splits]
    updatedSplits[index] = { ...updatedSplits[index], [field]: value }
    setFormData({ ...formData, splits: updatedSplits })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate transaction balances
    const totalDebits = formData.splits.reduce((sum, split) => sum + (parseFloat(split.debit) || 0), 0)
    const totalCredits = formData.splits.reduce((sum, split) => sum + (parseFloat(split.credit) || 0), 0)
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      alert('Transaction must balance: Total debits must equal total credits')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          splits: formData.splits.filter(split => split.accountId && (split.debit || split.credit))
        })
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({
          date: new Date().toISOString().split('T')[0],
          description: '',
          splits: [
            { accountId: '', debit: '', credit: '' },
            { accountId: '', debit: '', credit: '' }
          ]
        })
        router.refresh()
      } else {
        alert('Failed to create transaction')
      }
    } catch (error) {
      alert('Error creating transaction')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
      >
        <Plus className="w-4 h-4" />
        Add Transaction
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Add New Transaction</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Transaction description"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Transaction Splits</h4>
              <button
                type="button"
                onClick={addSplit}
                className="text-blue-600 text-sm flex items-center gap-1 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Split
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.splits.map((split, index) => (
                <div key={index} className="grid grid-cols-4 gap-2">
                  <select
                    value={split.accountId}
                    onChange={(e) => updateSplit(index, 'accountId', e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Account</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={split.debit}
                    onChange={(e) => updateSplit(index, 'debit', e.target.value)}
                    placeholder="Debit"
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={split.credit}
                    onChange={(e) => updateSplit(index, 'credit', e.target.value)}
                    placeholder="Credit"
                    className="px-3 py-2 border rounded-lg"
                  />
                  <div className="text-sm text-gray-500 py-2">
                    {split.debit && split.credit ? 'Error: Both debit and credit' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Creating...' : 'Create Transaction'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// === ./components/TransactionFilters.tsx ===
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

// === ./app/api/accounts/route.ts ===
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/database'
import { generateAccountCode } from '@/lib/utils'

export async function GET() {
  try {
    const user = await requireAuth()
    const accounts = await prisma.account.findMany({
      where: { userId: user.id },
      orderBy: [{ type: 'asc' }, { code: 'asc' }]
    })
    
    return NextResponse.json(accounts)
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { name, type, code, parentId } = body

    // Generate code if not provided
    let accountCode = code
    if (!accountCode) {
      const existingCodes = await prisma.account.findMany({
        where: { userId: user.id },
        select: { code: true }
      })
      accountCode = generateAccountCode(type, existingCodes.map(a => a.code).filter(Boolean))
    }

    const account = await prisma.account.create({
      data: {
        name,
        type,
        code: accountCode,
        parentId: parentId || null,
        userId: user.id
      }
    })

    return NextResponse.json(account)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}

// === ./app/api/transactions/route.ts ===
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')

    const where: any = { userId: user.id }
    
    if (month) {
      const startDate = new Date(`${month}-01`)
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
      where.date = {
        gte: startDate,
        lte: endDate,
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        splits: {
          include: {
            account: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { date, description, splits } = body

    // Validate transaction balances
    const totalDebits = splits.reduce((sum: number, split: any) => sum + (parseFloat(split.debit) || 0), 0)
    const totalCredits = splits.reduce((sum: number, split: any) => sum + (parseFloat(split.credit) || 0), 0)
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return NextResponse.json({ error: 'Transaction must balance' }, { status: 400 })
    }

    const transaction = await prisma.transaction.create({
      data: {
        date: new Date(date),
        description,
        userId: user.id,
        splits: {
          create: splits.map((split: any) => ({
            accountId: split.accountId,
            debit: parseFloat(split.debit) || 0,
            credit: parseFloat(split.credit) || 0
          }))
        }
      },
      include: {
        splits: {
          include: {
            account: true
          }
        }
      }
    })

    return NextResponse.json(transaction)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}