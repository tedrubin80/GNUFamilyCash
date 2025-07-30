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