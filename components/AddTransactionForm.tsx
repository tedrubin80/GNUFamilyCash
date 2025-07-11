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

//