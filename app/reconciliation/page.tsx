import { requireAuth } from '@/lib/auth'
import { getUserAccounts, getUserTransactions } from '@/lib/database'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CheckSquare, Square, AlertCircle } from 'lucide-react'

export default async function ReconciliationPage() {
  const user = await requireAuth()
  const [accounts, transactions] = await Promise.all([
    getUserAccounts(user.id),
    getUserTransactions(user.id)
  ])

  const bankAccounts = accounts.filter(a => a.type === 'ASSET' || a.type === 'LIABILITY')
  const unreconciledTransactions = transactions.filter(t => !t.reconciled)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Reconciliation</h1>
        <p className="text-gray-600">Reconcile your accounts with bank statements</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Account Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Account</th>
                <th className="text-right py-2">Current Balance</th>
                <th className="text-center py-2">Status</th>
                <th className="text-left py-2">Last Reconciled</th>
                <th className="text-center py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bankAccounts.map(account => (
                <tr key={account.id} className="border-b">
                  <td className="py-3 font-medium">{account.name}</td>
                  <td className="py-3 text-right">{formatCurrency(Number(account.balance))}</td>
                  <td className="py-3 text-center">
                    {account.reconciled ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                        <CheckSquare className="w-3 h-3" />
                        Reconciled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                        <AlertCircle className="w-3 h-3" />
                        Needs Reconciliation
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    {account.lastReconciled ? formatDate(account.lastReconciled) : 'Never'}
                  </td>
                  <td className="py-3 text-center">
                    {(user.role === 'ADMIN' || user.role === 'USER') && (
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                        Reconcile
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">
          Unreconciled Transactions ({unreconciledTransactions.length})
        </h3>
        {unreconciledTransactions.length > 0 ? (
          <div className="space-y-2">
            {unreconciledTransactions.slice(0, 10).map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-600">{formatDate(transaction.date)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">
                    {formatCurrency(Number(transaction.splits[0]?.debit || transaction.splits[0]?.credit || 0))}
                  </span>
                  <Square className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
            {unreconciledTransactions.length > 10 && (
              <p className="text-center text-gray-600 py-2">
                ... and {unreconciledTransactions.length - 10} more
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-600">All transactions are reconciled!</p>
        )}
      </div>
    </div>
  )
}
