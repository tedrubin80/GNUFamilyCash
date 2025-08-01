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
