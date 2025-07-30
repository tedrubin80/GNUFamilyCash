import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/database'
import { formatCurrency } from '@/lib/utils'
import { Target, Plus, TrendingUp, DollarSign } from 'lucide-react'

export default async function BudgetsPage() {
  const user = await requireAuth()
  
  const budgets = await prisma.budget.findMany({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          account: true
        }
      }
    },
    orderBy: { period: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-600">Plan and track your spending</p>
        </div>
        {(user.role === 'ADMIN' || user.role === 'USER') && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Create Budget
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Budgets</p>
              <p className="text-2xl font-bold text-blue-700">{budgets.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(
                  budgets
                    .filter(b => b.period === new Date().toISOString().slice(0, 7))
                    .reduce((sum, b) => sum + b.items.reduce((itemSum, item) => itemSum + Number(item.budgeted), 0), 0)
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Remaining</p>
              <p className="text-2xl font-bold text-purple-700">
                {formatCurrency(
                  budgets
                    .filter(b => b.period === new Date().toISOString().slice(0, 7))
                    .reduce((sum, b) => sum + b.items.reduce((itemSum, item) => itemSum + Number(item.budgeted) - Number(item.actual), 0), 0)
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {budgets.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No budgets yet</h3>
          <p className="text-gray-600 mb-4">Create your first budget to start tracking your spending goals</p>
          {(user.role === 'ADMIN' || user.role === 'USER') && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Create Budget
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => (
            <div key={budget.id} className="bg-white p-6 rounded-lg border">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{budget.name}</h3>
                  <p className="text-gray-600">{budget.period}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Budget</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(budget.items.reduce((sum, item) => sum + Number(item.budgeted), 0))}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                {budget.items.map((item) => {
                  const budgeted = Number(item.budgeted)
                  const actual = Number(item.actual)
                  const remaining = budgeted - actual
                  const percentage = budgeted > 0 ? (actual / budgeted) * 100 : 0
                  
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{item.account.name}</span>
                          <span className="text-sm text-gray-600">
                            {formatCurrency(actual)} / {formatCurrency(budgeted)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              percentage > 100 ? 'bg-red-500' : 
                              percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className={`font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {remaining >= 0 ? '+' : ''}{formatCurrency(remaining)}
                        </p>
                        <p className="text-xs text-gray-500">{percentage.toFixed(0)}%</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}