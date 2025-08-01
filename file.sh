#!/bin/bash

# Fix the SubscriptionsList component file name
echo "🔧 Fixing SubscriptionsList component..."

# Rename the file to match the import (case-sensitive)
mv components/subscriptionslist.tsx components/SubscriptionsList.tsx

# Also check if the content needs updating
cat > components/SubscriptionsList.tsx << 'EOF'
'use client'

import { formatCurrency } from '@/lib/utils'
import { Tv, Music, ShoppingCart, Smartphone, CreditCard, Cloud, Repeat } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Account {
  id: string
  name: string
  type: string
}

interface Props {
  userRole: string
  accounts: Account[]
}

interface Subscription {
  id: string
  name: string
  category: string
  amount: number
  renewalDate: string
  icon: any
  active: boolean
}

export function SubscriptionsList({ userRole, accounts }: Props) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [totals, setTotals] = useState({
    streaming: 0,
    music: 0,
    shopping: 0,
    total: 0
  })

  useEffect(() => {
    // In a real app, this would fetch from API
    // For now, we'll use mock data
    const mockSubscriptions: Subscription[] = [
      { id: '1', name: 'Netflix', category: 'streaming', amount: 15.49, renewalDate: '2025-02-01', icon: Tv, active: true },
      { id: '2', name: 'Spotify', category: 'music', amount: 9.99, renewalDate: '2025-02-05', icon: Music, active: true },
      { id: '3', name: 'Amazon Prime', category: 'shopping', amount: 14.99, renewalDate: '2025-02-10', icon: ShoppingCart, active: true },
      { id: '4', name: 'Disney+', category: 'streaming', amount: 7.99, renewalDate: '2025-02-15', icon: Tv, active: false },
    ]
    
    setSubscriptions(mockSubscriptions)
    
    // Calculate totals
    const newTotals = mockSubscriptions.reduce((acc, sub) => {
      if (sub.active) {
        acc.total += sub.amount
        if (sub.category === 'streaming') acc.streaming += sub.amount
        if (sub.category === 'music') acc.music += sub.amount
        if (sub.category === 'shopping') acc.shopping += sub.amount
      }
      return acc
    }, { streaming: 0, music: 0, shopping: 0, total: 0 })
    
    setTotals(newTotals)
    
    // Update the summary cards
    document.getElementById('streaming-total')!.textContent = formatCurrency(newTotals.streaming)
    document.getElementById('music-total')!.textContent = formatCurrency(newTotals.music)
    document.getElementById('shopping-total')!.textContent = formatCurrency(newTotals.shopping)
    document.getElementById('total-monthly')!.textContent = formatCurrency(newTotals.total)
  }, [])

  const getDaysUntilRenewal = (renewalDate: string) => {
    const today = new Date()
    const renewal = new Date(renewalDate)
    const diffTime = renewal.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const canEdit = userRole === 'ADMIN' || userRole === 'USER'

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Active Subscriptions</h3>
        
        {subscriptions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No subscriptions tracked yet. Add your subscriptions to monitor monthly costs.
          </p>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((subscription) => {
              const Icon = subscription.icon
              const daysUntil = getDaysUntilRenewal(subscription.renewalDate)
              const isExpiringSoon = daysUntil <= 7 && daysUntil >= 0
              
              return (
                <div
                  key={subscription.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    subscription.active ? 'bg-white' : 'bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      subscription.category === 'streaming' ? 'bg-red-100' :
                      subscription.category === 'music' ? 'bg-green-100' :
                      'bg-blue-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        subscription.category === 'streaming' ? 'text-red-600' :
                        subscription.category === 'music' ? 'text-green-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium">{subscription.name}</h4>
                      <p className="text-sm text-gray-600">
                        Renews {new Date(subscription.renewalDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(subscription.amount)}/mo</p>
                      {isExpiringSoon && subscription.active && (
                        <p className="text-xs text-orange-600">Renews in {daysUntil} days</p>
                      )}
                    </div>
                    {canEdit && (
                      <button
                        className={`px-3 py-1 rounded text-sm ${
                          subscription.active
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {subscription.active ? 'Pause' : 'Resume'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Add Common Subscriptions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Netflix', 'Spotify', 'Amazon Prime', 'Apple Music', 'YouTube Premium', 'Hulu', 'HBO Max', 'Microsoft 365'].map((service) => (
            <button
              key={service}
              className="p-3 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              disabled={!canEdit}
            >
              + {service}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
EOF

echo "✅ Fixed SubscriptionsList component"

# Also ensure the ScheduledTransactionsList component exists and is properly named
if [ -f "components/scheduledtransactionslist.ts" ]; then
  mv components/scheduledtransactionslist.ts components/ScheduledTransactionsList.tsx
fi

# Make sure AddScheduledTransactionForm has proper content
cat > components/AddScheduledTransactionForm.tsx << 'EOF'
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
EOF

echo "✅ Fixed AddScheduledTransactionForm component"

# Check if we need to fix other files
echo ""
echo "📋 Checking other potential issues..."

# Fix the API route location issue
if [ -f "api/api/schedualed-transactions/[id]/route.ts" ]; then
  echo "Found misplaced API route, moving to correct location..."
  mkdir -p app/api/scheduled-transactions/[id]
  mv "api/api/schedualed-transactions/[id]/route.ts" "app/api/scheduled-transactions/[id]/route.ts"
fi

# List all component files to verify
echo ""
echo "📁 Component files:"
ls -la components/

echo ""
echo "✅ Build fix complete! Try deploying again with:"
echo "railway up"
