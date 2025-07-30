'use client'

import { useState, useEffect } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, ExternalLink, Calendar, AlertTriangle } from 'lucide-react'

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
  amount: number
  category: string
  nextRenewal: string
  isActive: boolean
  website?: string
}

export function SubscriptionsList({ userRole, accounts }: Props) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSubscription, setNewSubscription] = useState({
    name: '',
    amount: '',
    category: 'streaming',
    website: '',
    paymentAccount: ''
  })

  const canEdit = userRole === 'ADMIN' || userRole === 'USER'

  // Common subscription templates
  const subscriptionTemplates = [
    { name: 'Netflix', category: 'streaming', amount: '15.49', website: 'netflix.com' },
    { name: 'Spotify', category: 'music', amount: '9.99', website: 'spotify.com' },
    { name: 'Amazon Prime', category: 'shopping', amount: '14.98', website: 'amazon.com' },
    { name: 'Apple iCloud', category: 'cloud', amount: '2.99', website: 'icloud.com' },
    { name: 'Disney+', category: 'streaming', amount: '7.99', website: 'disneyplus.com' },
    { name: 'YouTube Premium', category: 'streaming', amount: '11.99', website: 'youtube.com' },
    { name: 'Hulu', category: 'streaming', amount: '7.99', website: 'hulu.com' },
    { name: 'Adobe Creative Suite', category: 'software', amount: '52.99', website: 'adobe.com' }
  ]

  useEffect(() => {
    // Load subscriptions from scheduled transactions
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/scheduled-transactions')
      const scheduledTransactions = await response.json()
      
      // Filter for subscription-like transactions
      const subs = scheduledTransactions
        .filter((t: any) => t.name.toLowerCase().includes('subscription') || 
                          t.description?.toLowerCase().includes('subscription') ||
                          isCommonSubscription(t.name))
        .map((t: any) => ({
          id: t.id,
          name: t.name,
          amount: Number(t.amount),
          category: categorizeSubscription(t.name),
          nextRenewal: t.nextExecutionDate,
          isActive: t.isActive,
          website: extractWebsite(t.name)
        }))
      
      setSubscriptions(subs)
      updateSummaryCards(subs)
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    }
  }

  const isCommonSubscription = (name: string) => {
    const commonServices = ['netflix', 'spotify', 'amazon prime', 'disney', 'hulu', 'youtube', 'apple', 'adobe', 'microsoft']
    return commonServices.some(service => name.toLowerCase().includes(service))
  }

  const categorizeSubscription = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('netflix') || lowerName.includes('disney') || lowerName.includes('hulu') || lowerName.includes('youtube') || lowerName.includes('prime video')) return 'streaming'
    if (lowerName.includes('spotify') || lowerName.includes('apple music') || lowerName.includes('pandora')) return 'music'
    if (lowerName.includes('amazon') || lowerName.includes('costco') || lowerName.includes('walmart')) return 'shopping'
    if (lowerName.includes('adobe') || lowerName.includes('microsoft') || lowerName.includes('zoom')) return 'software'
    return 'other'
  }

  const extractWebsite = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('netflix')) return 'netflix.com'
    if (lowerName.includes('spotify')) return 'spotify.com'
    if (lowerName.includes('amazon')) return 'amazon.com'
    if (lowerName.includes('disney')) return 'disneyplus.com'
    if (lowerName.includes('hulu')) return 'hulu.com'
    if (lowerName.includes('youtube')) return 'youtube.com'
    return ''
  }

  const updateSummaryCards = (subs: Subscription[]) => {
    const streamingTotal = subs.filter(s => s.category === 'streaming').reduce((sum, s) => sum + s.amount, 0)
    const musicTotal = subs.filter(s => s.category === 'music').reduce((sum, s) => sum + s.amount, 0)
    const shoppingTotal = subs.filter(s => s.category === 'shopping').reduce((sum, s) => sum + s.amount, 0)
    const monthlyTotal = subs.filter(s => s.isActive).reduce((sum, s) => sum + s.amount, 0)

    document.getElementById('streaming-total')!.textContent = formatCurrency(streamingTotal)
    document.getElementById('music-total')!.textContent = formatCurrency(musicTotal)
    document.getElementById('shopping-total')!.textContent = formatCurrency(shoppingTotal)
    document.getElementById('total-monthly')!.textContent = formatCurrency(monthlyTotal)
  }

  const fillTemplate = (template: typeof subscriptionTemplates[0]) => {
    setNewSubscription({
      name: template.name,
      amount: template.amount,
      category: template.category,
      website: template.website,
      paymentAccount: ''
    })
  }

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Create as a scheduled transaction
      const response = await fetch('/api/scheduled-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${newSubscription.name} Subscription`,
          description: `Monthly subscription to ${newSubscription.name}`,
          amount: parseFloat(newSubscription.amount),
          frequency: 'MONTHLY',
          startDate: new Date().toISOString().split('T')[0],
          debitAccountId: accounts.find(a => a.type === 'EXPENSE')?.id,
          creditAccountId: newSubscription.paymentAccount || accounts.find(a => a.type === 'ASSET')?.id,
          autoExecute: true
        })
      })

      if (response.ok) {
        setShowAddForm(false)
        setNewSubscription({ name: '', amount: '', category: 'streaming', website: '', paymentAccount: '' })
        fetchSubscriptions()
      } else {
        alert('Failed to add subscription')
      }
    } catch (error) {
      alert('Error adding subscription')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'streaming': return '📺'
      case 'music': return '🎵'
      case 'shopping': return '🛒'
      case 'software': return '💻'
      default: return '📱'
    }
  }

  const getDaysUntilRenewal = (renewalDate: string) => {
    const days = Math.ceil((new Date(renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Subscriptions</h3>
        {canEdit && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            Add Subscription
          </button>
        )}
      </div>

      {subscriptions.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border text-center">
          <div className="text-6xl mb-4">💳</div>
          <h3 className="text-lg font-semibold mb-2">No subscriptions found</h3>
          <p className="text-gray-600 mb-4">Add your first subscription to start tracking your recurring expenses</p>
          {canEdit && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Add Subscription
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((subscription) => {
            const daysUntilRenewal = getDaysUntilRenewal(subscription.nextRenewal)
            const isRenewingSoon = daysUntilRenewal <= 7
            
            return (
              <div key={subscription.id} className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getCategoryIcon(subscription.category)}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{subscription.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{subscription.category}</p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${subscription.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monthly Cost</span>
                    <span className="font-semibold text-lg">{formatCurrency(subscription.amount)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Next Renewal</span>
                    <div className="text-right">
                      <p className="font-medium">{formatDate(subscription.nextRenewal)}</p>
                      {isRenewingSoon && (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {daysUntilRenewal} days
                        </p>
                      )}
                    </div>
                  </div>

                  {subscription.website && (
                    <div className="pt-2 border-t">
                      <a
                        href={`https://${subscription.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Visit {subscription.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Subscription</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Popular services:</p>
              <div className="grid grid-cols-2 gap-2">
                {subscriptionTemplates.slice(0, 6).map((template, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => fillTemplate(template)}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 text-left"
                  >
                    {template.name} - {formatCurrency(parseFloat(template.amount))}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddSubscription} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Payment Account</label>
                <select
                  value={newSubscription.paymentAccount}
                  onChange={(e) => setNewSubscription({ ...newSubscription, paymentAccount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select Payment Account</option>
                  {accounts.filter(a => a.type === 'ASSET').map(account => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Website (Optional)</label>
                <input
                  type="text"
                  value={newSubscription.website}
                  onChange={(e) => setNewSubscription({ ...newSubscription, website: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., netflix.com"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  Add Subscription
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} className="block text-sm font-medium mb-2">Service Name</label>
                <input
                  type="text"
                  value={newSubscription.name}
                  onChange={(e) => setNewSubscription({ ...newSubscription, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Netflix"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Monthly Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSubscription.amount}
                    onChange={(e) => setNewSubscription({ ...newSubscription, amount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={newSubscription.category}
                    onChange={(e) => setNewSubscription({ ...newSubscription, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="streaming">Streaming</option>
                    <option value="music">Music & Audio</option>
                    <option value="shopping">Shopping</option>
                    <option value="software">Software</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label