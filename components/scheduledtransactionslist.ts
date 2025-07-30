'use client'

import { useState, useEffect } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Play, Pause, Edit, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react'

interface ScheduledTransaction {
  id: string
  name: string
  description: string
  amount: number
  frequency: string
  nextExecutionDate: string
  isActive: boolean
  autoExecute: boolean
  debitAccount: { name: string }
  creditAccount: { name: string }
  executions: Array<{
    id: string
    scheduledDate: string
    executedDate: string | null
    status: string
  }>
}

interface Props {
  userRole: string
}

export function ScheduledTransactionsList({ userRole }: Props) {
  const [scheduledTransactions, setScheduledTransactions] = useState<ScheduledTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState<string | null>(null)

  const canEdit = userRole === 'ADMIN' || userRole === 'USER'

  useEffect(() => {
    fetchScheduledTransactions()
  }, [])

  const fetchScheduledTransactions = async () => {
    try {
      const response = await fetch('/api/scheduled-transactions')
      const data = await response.json()
      setScheduledTransactions(data)
      
      // Update summary cards
      updateSummaryCards(data)
    } catch (error) {
      console.error('Error fetching scheduled transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSummaryCards = (transactions: ScheduledTransaction[]) => {
    const active = transactions.filter(t => t.isActive).length
    const today = new Date().toDateString()
    const dueToday = transactions.filter(
      t => new Date(t.nextExecutionDate).toDateString() === today
    ).length
    const thisMonth = transactions.filter(t => {
      const nextDate = new Date(t.nextExecutionDate)
      const now = new Date()
      return nextDate.getMonth() === now.getMonth() && nextDate.getFullYear() === now.getFullYear()
    }).reduce((sum, t) => sum + Number(t.amount), 0)

    document.getElementById('active-count')!.textContent = active.toString()
    document.getElementById('due-today-count')!.textContent = dueToday.toString()
    document.getElementById('month-total')!.textContent = formatCurrency(thisMonth)
  }

  const executeTransaction = async (id: string) => {
    if (!canEdit) return
    
    setExecuting(id)
    try {
      const response = await fetch('/api/scheduled-transactions/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledTransactionId: id })
      })
      
      if (response.ok) {
        await fetchScheduledTransactions()
        alert('Transaction executed successfully!')
      } else {
        alert('Failed to execute transaction')
      }
    } catch (error) {
      alert('Error executing transaction')
    } finally {
      setExecuting(null)
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    if (!canEdit) return
    
    try {
      const response = await fetch(`/api/scheduled-transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })
      
      if (response.ok) {
        await fetchScheduledTransactions()
      }
    } catch (error) {
      console.error('Error toggling transaction:', error)
    }
  }

  const getFrequencyDisplay = (frequency: string) => {
    return frequency.charAt(0) + frequency.slice(1).toLowerCase()
  }

  const getStatusIcon = (execution: any) => {
    switch (execution.status) {
      case 'EXECUTED':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  if (loading) {
    return <div className="bg-white p-6 rounded-lg border">Loading...</div>
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Your Scheduled Transactions</h3>
      </div>
      
      {scheduledTransactions.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No scheduled transactions yet. Create one to get started!
        </div>
      ) : (
        <div className="divide-y">
          {scheduledTransactions.map((transaction) => (
            <div key={transaction.id} className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    transaction.isActive ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <div>
                    <h4 className="font-semibold text-gray-900">{transaction.name}</h4>
                    {transaction.description && (
                      <p className="text-sm text-gray-600">{transaction.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">{formatCurrency(Number(transaction.amount))}</p>
                  <p className="text-sm text-gray-600">{getFrequencyDisplay(transaction.frequency)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">From → To</p>
                  <p className="font-medium">
                    {transaction.debitAccount.name} → {transaction.creditAccount.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Next Execution</p>
                  <p className="font-medium">{formatDate(transaction.nextExecutionDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Auto Execute</p>
                  <p className="font-medium">{transaction.autoExecute ? 'Yes' : 'Manual'}</p>
                </div>
              </div>

              {transaction.executions.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Recent Executions</p>
                  <div className="flex gap-2">
                    {transaction.executions.slice(0, 3).map((execution) => (
                      <div key={execution.id} className="flex items-center gap-1 text-xs">
                        {getStatusIcon(execution)}
                        <span>{formatDate(execution.scheduledDate)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {canEdit && (
                <div className="flex gap-2">
                  <button
                    onClick={() => executeTransaction(transaction.id)}
                    disabled={executing === transaction.id || !transaction.isActive}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    {executing === transaction.id ? 'Executing...' : 'Execute Now'}
                  </button>
                  <button
                    onClick={() => toggleActive(transaction.id, transaction.isActive)}
                    className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                      transaction.isActive
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {transaction.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    {transaction.isActive ? 'Pause' : 'Activate'}
                  </button>
                  <button className="text-gray-600 hover:text-gray-800 px-2">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-800 px-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}