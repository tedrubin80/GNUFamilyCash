// File: components/SubscriptionsList.tsx

'use client'

import { formatCurrency } from '@/lib/utils'
import { Tv, Music, ShoppingCart, Smartphone, CreditCard, Cloud, Repeat, Plus, Edit, Trash2 } from 'lucide-react'
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
  website?: string
}

export function SubscriptionsList({ userRole, accounts }: Props) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSubscription, setNewSubscription] = useState({
    name: '',
    category: 'streaming',
    amount: '',
    renewalDate: '',
    website: ''
  })
  const [totals, setTotals] = useState({
    streaming: 0,
    music: 0,
    shopping: 0,
    software: 0,
    total: 0
  })

  const canEdit = userRole === 'ADMIN' || userRole === 'USER'

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const loadSubscriptions = () => {
    // In a real app, this would fetch from API
    // For now, we'll use mock data with common subscriptions
    const mockSubscriptions: Subscription[] = [
      { id: '1', name: 'Netflix', category: 'streaming', amount: 15.49, renewalDate: '2025-09-01', icon: Tv, active: true, website: 'netflix.com' },
      { id: '2', name: 'Spotify', category: 'music', amount: 9.99, renewalDate: '2025-09-05', icon: Music, active: true, website: 'spotify.com' },
      { id: '3', name: 'Amazon Prime', category: 'shopping', amount: 14.99, renewalDate: '2025-09-10', icon: ShoppingCart, active: true, website: 'amazon.com' },
      { id: '4', name: 'Disney+', category: 'streaming', amount: 7.99, renewalDate: '2025-09-15', icon: Tv, active: false, website: 'disneyplus.com' },
      { id: '5', name: 'Adobe Creative', category: 'software', amount: 52.99, renewalDate: '2025-08-20', icon: CreditCard, active: true, website: 'adobe.com' },
    ]
    
    setSubscriptions(mockSubscriptions)
    calculateTotals(mockSubscriptions)
  }

  const calculateTotals = (subs: Subscription[]) => {
    const newTotals = subs.reduce((acc, sub) => {
      if (sub.active) {
        acc.total += sub.amount
        if (sub.category === 'streaming') acc.streaming += sub.amount
        if (sub.category === 'music') acc.music += sub.amount
        if (sub.category === 'shopping') acc.shopping += sub.amount
        if (sub.category === 'software') acc.software += sub.amount
      }
      return acc
    }, { streaming: 0, music: 0, shopping: 0, software: 0, total: 0 })
    
    setTotals(newTotals)
    
    // Update the summary cards
    const streamingEl = document.getElementById('streaming-total')
    const musicEl = document.getElementById('music-total')
    const shoppingEl = document.getElementById('shopping-total')
    const totalEl = document.getElementById('total-monthly')
    
    if (streamingEl) streamingEl.textContent = formatCurrency(newTotals.streaming)
    if (musicEl) musicEl.textContent = formatCurrency(newTotals.music)
    if (shoppingEl) shoppingEl.textContent = formatCurrency(newTotals.shopping)
    if (totalEl) totalEl.textContent = formatCurrency(newTotals.total)
  }

  const getDaysUntilRenewal = (renewalDate: string) => {
    const today = new Date()
    const renewal = new Date(renewalDate)
    const diffTime = renewal.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'streaming': return Tv
      case 'music': return Music
      case 'shopping': return ShoppingCart
      case 'software': return CreditCard
      default: return Smartphone
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'streaming': return 'bg-red-100 text-red-600'
      case 'music': return 'bg-green-100 text-green-600'
      case 'shopping': return 'bg-blue-100 text-blue-600'
      case 'software': return 'bg-purple-100 text-purple-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const toggleSubscription = (id: string) => {
    if (!canEdit) return
    
    const updated = subscriptions.map(sub => 
      sub.id === id ? { ...sub, active: !sub.active } : sub
    )
    setSubscriptions(updated)
    calculateTotals(updated)
  }

  const deleteSubscription = (id: string) => {
    if (!canEdit) return
    
    if (!confirm('Are you sure you want to delete this subscription?')) return
    
    const updated = subscriptions.filter(sub => sub.id !== id)
    setSubscriptions(updated)
    calculateTotals(updated)
  }

  const addSubscription = () => {
    if (!canEdit) return
    
    const newSub: Subscription = {
      id: Date.now().toString(),
      name: newSubscription.name,
      category: newSubscription.category,
      amount: parseFloat(newSubscription.amount),
      renewalDate: newSubscription.renewalDate,
      website: newSubscription.website,
      icon: getCategoryIcon(newSubscription.category),
      active: true
    }
    
    const updated = [...subscriptions, newSub]
    setSubscriptions(updated)
    calculateTotals(updated)
    
    // Reset form
    setNewSubscription({
      name: '',
      category: 'streaming',
      amount: '',
      renewalDate: '',
      website: ''
    })
    setShowAddForm(false)
  }

  const popularServices = [
    { name: 'Netflix', category: 'streaming', amount: 15.49 },
    { name: 'Spotify', category: 'music', amount: 9.99 },
    { name: 'Amazon Prime', category: 'shopping', amount: 14.99 },
    { name: 'Apple Music', category: 'music', amount: 10.99 },
    { name: 'YouTube Premium', category: 'streaming', amount: 11.99 },
    { name: 'Hulu', category: 'streaming', amount: 7.99 },
    { name: 'HBO Max', category: 'streaming', amount: 15.99 },
    { name: 'Microsoft 365', category: 'software', amount: 9.99 }
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Active Subscriptions</h3>
          {canEdit && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Subscription
            </button>
          )}
        </div>
        
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
                    <div className={`p-2 rounded-lg ${getCategoryColor(subscription.category)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{subscription.name}</h4>
                      <p className="text-sm text-gray-600">
                        Renews {new Date(subscription.renewalDate).toLocaleDateString()}
                      </p>
                      {subscription.website && (
                        <a 
                          href={`https://${subscription.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {subscription.website}
                        </a>
                      )}
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSubscription(subscription.id)}
                          className={`px-3 py-1 rounded text-sm ${
                            subscription.active
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {subscription.active ? 'Pause' : 'Resume'}
                        </button>
                        <button
                          onClick={() => deleteSubscription(subscription.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Add Popular Subscriptions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {popularServices.map((service) => (
            <button
              key={service.name}
              onClick={() => {
                if (!canEdit) return
                setNewSubscription({
                  name: service.name,
                  category: service.category,
                  amount: service.amount.toString(),
                  renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  website: ''
                })
                setShowAddForm(true)
              }}
              className="p-3 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50 text-left"
              disabled={!canEdit}
            >
              <div className="font-medium">{service.name}</div>
              <div className="text-gray-500">{formatCurrency(service.amount)}/mo</div>
            </button>
          ))}
        </div>
      </div>

      {/* Add Subscription Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Subscription</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Service Name</label>
                <input
                  type="text"
                  value={newSubscription.name}
                  onChange={(e) => setNewSubscription({...newSubscription, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Netflix"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={newSubscription.category}
                  onChange={(e) => setNewSubscription({...newSubscription, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="streaming">Streaming</option>
                  <option value="music">Music</option>
                  <option value="shopping">Shopping</option>
                  <option value="software">Software</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Monthly Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={newSubscription.amount}
                  onChange={(e) => setNewSubscription({...newSubscription, amount: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Next Renewal Date</label>
                <input
                  type="date"
                  value={newSubscription.renewalDate}
                  onChange={(e) => setNewSubscription({...newSubscription, renewalDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Website (Optional)</label>
                <input
                  type="text"
                  value={newSubscription.website}
                  onChange={(e) => setNewSubscription({...newSubscription, website: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., netflix.com"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={addSubscription}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Subscription
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}