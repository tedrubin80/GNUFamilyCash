import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/database'
import { Users, Settings, Database, Activity, Shield, HardDrive } from 'lucide-react'

export default async function AdminDashboard() {
  const user = await requireAdmin()
  
  const [userCount, accountCount, transactionCount] = await Promise.all([
    prisma.user.count(),
    prisma.account.count(),
    prisma.transaction.count(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">System administration and configuration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{userCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <Database className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Accounts</p>
              <p className="text-2xl font-bold text-gray-900">{accountCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{transactionCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center mb-4">
            <Users className="w-6 h-6 text-blue-600" />
            <h3 className="ml-2 text-lg font-semibold">User Management</h3>
          </div>
          <p className="text-gray-600 mb-4">Manage family members and their access levels</p>
          <a
            href="/admin/users"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block"
          >
            Manage Users
          </a>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center mb-4">
            <Settings className="w-6 h-6 text-green-600" />
            <h3 className="ml-2 text-lg font-semibold">System Settings</h3>
          </div>
          <p className="text-gray-600 mb-4">Configure application settings and preferences</p>
          <a
            href="/admin/settings"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 inline-block"
          >
            System Settings
          </a>
        </div>
      </div>
    </div>
  )
}
