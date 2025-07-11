import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/database'
import { formatCurrency } from '@/lib/utils'
import { Target, Plus } from 'lucide-react'

export default async function BudgetsPage() {
  const user = await requireAuth()
  
  const budgets = await prisma.budget.findMany({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          account: true
        }
      }
    },
    orderBy: { period: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-600">Plan and track your spending</p>
        </div>
        {(user.role