'use client'

import { formatCurrency } from '@/lib/utils'
import { Tv } from 'lucide-react'

interface Account {
  id: string
  name: string
  type: string
}

interface Props {
  userRole: string
  accounts: Account[]
}

export function SubscriptionsList({ userRole, accounts }: Props) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Tv className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Subscriptions</h3>
      </div>
      <p className="text-gray-600">
        Subscription tracking coming soon. Track your recurring payments and subscriptions in one place.
      </p>
      <div className="mt-4 p-4 bg-gray-50 rounded">
        <p className="text-sm text-gray-500">
          This feature will allow you to:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
          <li>Track monthly subscriptions</li>
          <li>Get renewal alerts</li>
          <li>See total monthly costs</li>
          <li>Manage recurring payments</li>
        </ul>
      </div>
    </div>
  )
}