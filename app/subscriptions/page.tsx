import { requireAuth } from '@/lib/auth'
import { getUserAccounts } from '@/lib/database'
import { SubscriptionsList } from '@/components/SubscriptionsList'
import { Tv, Music, ShoppingCart, Smartphone } from 'lucide-react'

export default async function SubscriptionsPage() {
  const user = await requireAuth()
  const accounts = await getUserAccounts(user.id)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tv className="w-6 h-6 text-purple-600" />
            Subscription Manager
          </h1>
          <p className="text-gray-600">Track and manage your recurring subscriptions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <Tv className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Streaming</p>
              <p className="text-2xl font-bold text-red-700" id="streaming-total">$0</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <Music className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Music & Audio</p>
              <p className="text-2xl font-bold text-green-700" id="music-total">$0</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Shopping</p>
              <p className="text-2xl font-bold text-blue-700" id="shopping-total">$0</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">  
          <div className="flex items-center">
            <Smartphone className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Total</p>
              <p className="text-2xl font-bold text-purple-700" id="total-monthly">$0</p>
            </div>
          </div>
        </div>
      </div>

      <SubscriptionsList userRole={user.role} accounts={accounts} />
    </div>
  )
}