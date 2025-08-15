// File: components/AddScheduledTransactionForm.tsx

'use client'

import { useState } from 'react'
import { Plus, Save, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Account {
  id: string
  name: string
  type: string
}

interface Props {
  accounts: Account[]
}

export function AddScheduledTransactionForm({ accounts }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    frequency: 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    debitAccountId: '',
    creditAccountId: '',
    autoExecute: false
  })
  
  const router = useRouter()

  const frequencies = [
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'BIWEEKLY', label: 'Bi-weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'QUARTERLY', label: 'Quarterly' },
    { value: 'YEARLY', label: 'Yearly' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/scheduled-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({
          name: '',
          description: '',
          amount: '',
          frequency: 'MONTHLY',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          debitAccountId: '',
          creditAccountId: '',
          autoExecute: false
        })
        router.refresh()
      } else {
        alert('Failed to create scheduled transaction')
      }
    } catch (error) {
      alert('Error creating scheduled transaction')
    } finally {
      setIsSubmitting(false)
    }
  }

  const commonSchedules = [
    { name: 'Monthly Rent', debitAccount: 'EXPENSE', creditAccount: 'ASSET', frequency: 'MONTHLY' },
    { name: 'Salary', debitAccount: 'ASSET', creditAccount: 'INCOME', frequency: 'MONTHLY' },
    { name: 'Netflix Subscription', debitAccount: 'EXPENSE', creditAccount: 'ASSET', frequency: 'MONTHLY' },
    { name: 'Weekly Groceries', debitAccount: 'EXPENSE', creditAccount: 'ASSET', frequency: 'WEEKLY' }
  ]

  const fillTemplate = (template: typeof commonSchedules[0]) => {
    const debitAccount = accounts.find(a => a.type === template.debitAccount)
    const creditAccount = accounts.find(a => a.type === template.creditAccount)
    
    setFormData({
      ...formData,
      name: template.name,
      frequency: template.frequency,
      debitAccountId: debitAccount?.id || '',
      creditAccountId: creditAccount?.id || ''
    })
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
      >
        <Plus className="w-4 h-4" />
        Schedule Transaction
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Schedule New Transaction
        </h3>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Quick templates:</p>
          <div className="flex flex-wrap gap-2">
            {commonSchedules.map((template, index) => (
              <button
                key={index}
                type="button"
                onClick={() => fillTemplate(template)}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Transaction Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Monthly Rent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={2}
              placeholder="Additional details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {frequencies.map(freq => (
                  <option key={freq.value} value={freq.value}>{freq.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Date (Optional)</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for indefinite schedule</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">From Account (Debit)</label>
              <select
                value={formData.debitAccountId}
                onChange={(e) => setFormData({ ...formData, debitAccountId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Select Account</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">To Account (Credit)</label>
              <select
                value={formData.creditAccountId}
                onChange={(e) => setFormData({ ...formData, creditAccountId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Select Account</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoExecute"
              checked={formData.autoExecute}
              onChange={(e) => setFormData({ ...formData, autoExecute: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="autoExecute" className="ml-2 text-sm">
              Auto-execute transactions (automatically run when due)
            </label>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Creating...' : 'Create Schedule'}
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