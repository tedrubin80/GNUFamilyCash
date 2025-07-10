// File Locations:
// ./app/layout.tsx
// ./app/dashboard/page.tsx
// ./app/accounts/page.tsx
// ./app/transactions/page.tsx

// === ./app/layout.tsx ===
import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Navigation } from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Family GnuCash',
  description: 'Family accounting and financial management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="max-w-7xl mx-auto px-4 py-6">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}

// === ./app/providers.tsx ===
'use client'

import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}

// === ./app/dashboard/page.tsx ===
import { requireAuth } from '@/lib/auth'
import { getUserAccounts, getUserTransactions } from '@/lib/database'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TrendingUp, CreditCard, DollarSign, BarChart3, CheckSquare } from 'lucide-react'

export default async function Dashboard() {
  const user = await requireAuth()
  const [accounts, transactions] = await Promise.all([
    getUserAccounts(user.id),
    getUserTransactions(user.id)
  ])

  // Calculate financial summary
  const summary = accounts.reduce((acc, account) => {
    const balance = Number(account.balance)
    switch (account.type) {
      case 'ASSET':
        acc.assets += balance
        break
      case 'LIABILITY':
        acc.liabilities += Math.abs(balance)
        break
      case 'INCOME':
        acc.income += Math.abs(balance)
        break
      case 'EXPENSE':
        acc.expenses += balance
        break
    }
    return acc
  }, { assets: 0, liabilities: 0, income: 0, expenses: 0 })

  const netWorth = summary.assets - summary.liabilities
  const netIncome = summary.income - summary.expenses

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.name}</p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(summary.assets)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CreditCard className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Liabilities</p>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(summary.liabilities)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Net Worth</p>
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(netWorth)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Net Income</p>
              <p className="text-2xl font-bold text-purple-700">{formatCurrency(netIncome)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-600">{formatDate(transaction.date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${
                    transaction.splits[0]?.debit ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.splits[0]?.debit 
                      ? `+${formatCurrency(Number(transaction.splits[0].debit))}`
                      : `-${formatCurrency(Number(transaction.splits[0]?.credit || 0))}`
                    }
                  </span>
                  {transaction.reconciled && (
                    <CheckSquare className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Balances */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Account Balances</h3>
          <div className="space-y-3">
            {accounts.filter(a => a.type === 'ASSET' || a.type === 'LIABILITY').slice(0, 6).map((account) => (
              <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{account.name}</p>
                  <p className="text-sm text-gray-600">{account.type}</p>
                </div>
                <span className={`font-semibold ${
                  Number(account.balance) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(Number(account.balance))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// === ./app/accounts/page.tsx ===
import { requireAuth } from '@/lib/auth'
import { getUserAccounts } from '@/lib/database'
import { AccountsList } from '@/components/AccountsList'
import { AddAccountForm } from '@/components/AddAccountForm'

export default async function AccountsPage() {
  const user = await requireAuth()
  const accounts = await getUserAccounts(user.id)

  // Group accounts by type
  const groupedAccounts = accounts.reduce((acc, account) => {
    if (!acc[account.type]) {
      acc[account.type] = []
    }
    acc[account.type].push(account)
    return acc
  }, {} as Record<string, typeof accounts>)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
          <p className="text-gray-600">Manage your account structure</p>
        </div>
        {(user.role === 'ADMIN' || user.role === 'USER') && (
          <AddAccountForm accounts={accounts} />
        )}
      </div>

      <AccountsList groupedAccounts={groupedAccounts} userRole={user.role} />
    </div>
  )
}

// === ./app/transactions/page.tsx ===
import { requireAuth } from '@/lib/auth'
import { getUserTransactions, getUserAccounts } from '@/lib/database'
import { TransactionsList } from '@/components/TransactionsList'
import { AddTransactionForm } from '@/components/AddTransactionForm'
import { TransactionFilters } from '@/components/TransactionFilters'

interface PageProps {
  searchParams: { month?: string; account?: string; search?: string }
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const user = await requireAuth()
  const [accounts, transactions] = await Promise.all([
    getUserAccounts(user.id),
    getUserTransactions(user.id, searchParams.month)
  ])

  // Filter transactions based on search params
  let filteredTransactions = transactions

  if (searchParams.account) {
    filteredTransactions = filteredTransactions.filter(t =>
      t.splits.some(s => s.account.name === searchParams.account)
    )
  }

  if (searchParams.search) {
    const searchTerm = searchParams.search.toLowerCase()
    filteredTransactions = filteredTransactions.filter(t =>
      t.description.toLowerCase().includes(searchTerm) ||
      t.splits.some(s => s.account.name.toLowerCase().includes(searchTerm))
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">View and manage your transactions</p>
        </div>
        {(user.role === 'ADMIN' || user.role === 'USER') && (
          <AddTransactionForm accounts={accounts} />
        )}
      </div>

      <TransactionFilters 
        accounts={accounts}
        currentMonth={searchParams.month}
        currentAccount={searchParams.account}
        currentSearch={searchParams.search}
      />

      <TransactionsList 
        transactions={filteredTransactions}
        userRole={user.role}
      />
    </div>
  )
}

// === ./components/Navigation.tsx ===
'use client'

import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  Wallet, 
  CreditCard, 
  Target, 
  BarChart3, 
  CheckSquare, 
  Upload, 
  Settings, 
  LogOut 
} from 'lucide-react'

export function Navigation() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session || pathname === '/login') {
    return null
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Accounts', href: '/accounts', icon: Wallet },
    { name: 'Transactions', href: '/transactions', icon: CreditCard },
    { name: 'Budgets', href: '/budgets', icon: Target },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Reconciliation', href: '/reconciliation', icon: CheckSquare },
    { name: 'Import/Export', href: '/import-export', icon: Upload },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              Family GnuCash
            </Link>
            
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {session.user?.name}
            </span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {session.user?.role}
            </span>
            
            {session.user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            )}
            
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// === ./app/globals.css ===
@tailwind base;
@tailwind components;
@tailwind utilities;