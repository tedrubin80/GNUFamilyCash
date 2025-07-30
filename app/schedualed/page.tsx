import { requireAuth } from '@/lib/auth'
import { getUserAccounts } from '@/lib/database'
import { ScheduledTransactionsList } from '@/components/ScheduledTransactionsList'
import { AddScheduledTransactionForm } from '@/components/AddScheduledTransactionForm'
import { Calendar, Clock, Repeat } from 'lucide-react'

export default async function ScheduledTransactionsPage() {
  const user = await requireAuth()
  const accounts = await getUserAccounts(user.id)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Repeat className="w-6 h-6 text-blue-600" />
            Scheduled Transactions
          </h1>
          <p className="text-gray-600">Automate recurring transactions like rent, subscriptions, and salary</p>
        </div>
        {(user.role === 'ADMIN' || user.role === 'USER') && (
          <AddScheduledTransactionForm accounts={accounts} />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Schedules</p>
              <p className="text-2xl font-bold text-green-700" id="active-count">-</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Due Today</p>
              <p className="text-2xl font-bold text-blue-700" id="due-today-count">-</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <Repeat className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-purple-700" id="month-total">-</p>
            </div>
          </div>
        </div>
      </div>

      <ScheduledTransactionsList userRole={user.role} />
    </div>
  )
}