import { requireAdmin } from '@/lib/auth'
import Link from 'next/link'
import { Users, Settings, Database, Shield } from 'lucide-react'

export default async function AdminDashboard() {
  const user = await requireAdmin()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/users" className="bg-white p-6 rounded-lg border hover:shadow-lg">
          <Users className="w-8 h-8 text-blue-600 mb-3" />
          <h2 className="text-lg font-semibold">User Management</h2>
          <p className="text-gray-600">Manage family members and roles</p>
        </Link>
        <Link href="/admin/settings" className="bg-white p-6 rounded-lg border hover:shadow-lg">
          <Settings className="w-8 h-8 text-green-600 mb-3" />
          <h2 className="text-lg font-semibold">System Settings</h2>
          <p className="text-gray-600">Configure application settings</p>
        </Link>
      </div>
    </div>
  )
}
