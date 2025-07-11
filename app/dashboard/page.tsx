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