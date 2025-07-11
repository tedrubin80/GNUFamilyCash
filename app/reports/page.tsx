import { requireAuth } from '@/lib/auth'
import { getUserAccounts, getUserTransactions } from '@/lib/database'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BarChart3, TrendingUp, PieChart } from 'lucide-react'

export default async function ReportsPage() {
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
      case 'EQUITY':
        acc.equity += balance
        break
    }
    return acc
  }, { assets: 0, liabilities: 0, income: 0, expenses: 0, equity: 0 })

  const netWorth = summary.assets - summary.liabilities
  const netIncome = summary.income - summary.expenses

  // Group accounts by type for detailed breakdown
  const accountsByType = accounts.reduce((acc, account) => {
    if (!acc[account.type]) acc[account.type] = []
    acc[account.type].push(account)
    return acc
  }, {} as Record<string, typeof accounts>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
        <p className="text-gray-600">Comprehensive view of your financial position</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Net Worth</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(netWorth)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Net Income</p>
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(netIncome)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <PieChart className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-purple-700">{formatCurrency(summary.assets)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Liabilities</p>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(summary.liabilities)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Sheet */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Balance Sheet</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Assets</h4>
              {accountsByType.ASSET?.map(account => (
                <div key={account.id} className="flex justify-between text-sm py-1">
                  <span>{account.name}</span>
                  <span className="font-medium">{formatCurrency(Number(account.balance))}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total Assets</span>
                <span>{formatCurrency(summary.assets)}</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Liabilities</h4>
              {accountsByType.LIABILITY?.map(account => (
                <div key={account.id} className="flex justify-between text-sm py-1">
                  <span>{account.name}</span>
                  <span className="font-medium">{formatCurrency(Math.abs(Number(account.balance)))}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total Liabilities</span>
                <span>{formatCurrency(summary.liabilities)}</span>
              </div>
            </div>
            
            <div className="border-t-2 pt-2 flex justify-between font-bold text-lg">
              <span>Net Worth</span>
              <span className={netWorth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatCurrency(netWorth)}
              </span>
            </div>
          </div>
        </div>

        {/* Income Statement */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Income Statement</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Income</h4>
              {accountsByType.INCOME?.map(account => (
                <div key={account.id} className="flex justify-between text-sm py-1">
                  <span>{account.name}</span>
                  <span className="font-medium">{formatCurrency(Math.abs(Number(account.balance)))}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total Income</span>
                <span>{formatCurrency(summary.income)}</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Expenses</h4>
              {accountsByType.EXPENSE?.map(account => (
                <div key={account.id} className="flex justify-between text-sm py-1">
                  <span>{account.name}</span>
                  <span className="font-medium">{formatCurrency(Number(account.balance))}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total Expenses</span>
                <span>{formatCurrency(summary.expenses)}</span>
              </div>
            </div>
            
            <div className="border-t-2 pt-2 flex justify-between font-bold text-lg">
              <span>Net Income</span>
              <span className={netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatCurrency(netIncome)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

//