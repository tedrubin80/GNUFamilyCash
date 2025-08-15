// File: components/ScheduledTransactionsList.tsx

'use client'

import { useState, useEffect } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Play, Pause, Edit, Trash2, Calendar, Clock, DollarSign } from 'lucide-react'

interface ScheduledTransaction {
  id: string
  name: string
  description?: string
  amount: number
  frequency: string
  nextExecutionDate: string
  isActive: boolean
  autoExecute: boolean
  debitAccount: { name: string }
  creditAccount: { name: string }
  executions: Array<{
    id: string
    executedDate?: string
    status: string
  }>
}

interface Props {
  userRole: string
}

export function ScheduledTransactionsList({ userRole }: Props) {
  const [transactions, setTransactions] = useState<ScheduledTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState<string | null>(null)

  const canEdit = userRole === 'ADMIN' || userRole === 'USER'

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/scheduled-transactions')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
        
        // Update summary cards
        updateSummaryCards(data)
      }
    } catch (error) {
      console.error('Error fetching scheduled transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSummaryCards = (data: ScheduledTransaction[]) => {
    const active = data.filter(t => t.isActive).length
    const today = new Date().toDateString()
    const dueToday = data.filter(t => 
      t.isActive && new Date(t.nextExecutionDate).toDateString() === today
    ).length
    
    const thisMonth = data.filter(t => {
      const execDate = new Date(t.nextExecutionDate)
      const now = new Date()
      return t.isActive && 
             execDate.getMonth() === now.getMonth() && 
             execDate.getFullYear() === now.getFullYear()
    }).reduce((sum, t) => sum + Number(t.amount), 0)

    // Update DOM elements if they exist
    const activeEl = document.getElementById('active-count')
    const dueTodayEl = document.getElementById('due-today-count')
    const monthTotalEl = document.getElementById('month-total')
    
    if (activeEl) activeEl.textContent = active.toString()
    if (dueTodayEl) dueTodayEl.textContent = dueToday.toString()
    if (monthTotalEl) monthTotalEl.textContent = formatCurrency(thisMonth)
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
        await fetchTransactions() // Refresh data
      } else {
        alert('Failed to execute transaction')
      }
    } catch (error) {
      alert('Error executing transaction')
    } finally {
      setExecuting(null)
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    if (!canEdit) return
    
    try {
      const response = await fetch(`/api/scheduled-transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })
      
      if (response.ok) {
        await fetchTransactions()
      } else {
        alert('Failed to update transaction')
      }
    } catch (error) {
      alert('Error updating transaction')
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!canEdit) return
    
    if (!confirm('Are you sure you want to delete this scheduled transaction?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/scheduled-transactions/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchTransactions()
      } else {
        alert('Failed to delete transaction')
      }
    } catch (error) {
      alert('Error deleting transaction')
    }
  }

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'DAILY': return 'bg-blue-100 text-blue-800'
      case 'WEEKLY': return 'bg-green-100 text-green-800'
      case 'MONTHLY': return 'bg-purple-100 text-purple-800'
      case 'QUARTERLY': return 'bg-orange-100 text-orange-800'
      case 'YEARLY': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDaysUntilNext = (date: string) => {
    const nextDate = new Date(date)
    const today = new Date()
    const diffTime = nextDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg border">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Scheduled Transactions</h3>
      
      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold mb-2">No scheduled transactions</h4>
          <p className="text-gray-600">Create your first scheduled transaction to automate recurring payments.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const daysUntil = getDaysUntilNext(transaction.nextExecutionDate)
            const isOverdue = daysUntil < 0
            const isDueToday = daysUntil === 0
            
            return (
              <div
                key={transaction.id}
                className={`p-4 rounded-lg border ${
                  transaction.isActive 
                    ? isOverdue 
                      ? 'border-red-200 bg-red-50' 
                      : isDueToday 
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-gray-200 bg-white'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{transaction.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFrequencyColor(transaction.frequency)}`}>
                        {transaction.frequency}
                      </span>
                      {transaction.autoExecute && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          AUTO
                        </span>
                      )}
                      {!transaction.isActive && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          PAUSED
                        </span>
                      )}
                    </div>
                    
                    {transaction.description && (
                      <p className="text-gray-600 text-sm mb-2">{transaction.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>From: {transaction.debitAccount.name}</span>
                      <span>To: {transaction.creditAccount.name}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Next: {formatDate(transaction.nextExecutionDate)}
                        {isOverdue && <span className="text-red-600 font-medium">(Overdue)</span>}
                        {isDueToday && <span className="text-yellow-600 font-medium">(Due Today)</span>}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xl font-bold">
                        {formatCurrency(Number(transaction.amount))}
                      </div>
                      <div className="text-sm text-gray-500">
                        Last run: {transaction.executions[0]?.executedDate 
                          ? formatDate(transaction.executions[0].executedDate)
                          : 'Never'
                        }
                      </div>
                    </div>
                    
                    {canEdit && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => executeTransaction(transaction.id)}
                          disabled={!transaction.isActive || executing === transaction.id}
                          className="bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          title="Execute Now"
                        >
                          <Play className="w-4 h-4" />
                          {executing === transaction.id ? 'Running...' : 'Run'}
                        </button>
                        
                        <button
                          onClick={() => toggleActive(transaction.id, transaction.isActive)}
                          className={`p-2 rounded hover:opacity-80 ${
                            transaction.isActive 
                              ? 'bg-yellow-600 text-white' 
                              : 'bg-blue-600 text-white'
                          }`}
                          title={transaction.isActive ? 'Pause' : 'Resume'}
                        >
                          {transaction.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        
                        <button
                          onClick={() => deleteTransaction(transaction.id)}
                          className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}