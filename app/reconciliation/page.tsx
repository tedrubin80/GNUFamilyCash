import { requireAuth } from '@/lib/auth'
import { getUserAccounts, getUserTransactions } from '@/lib/database'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CheckSquare, Square, AlertCircle } from 'lucide-react'

export default async function ReconciliationPage() {
  const user = await requireAuth()
  const [accounts, transactions] = await Promise.all([
    getUserAccounts(user.id),
    getUserTransactions(user.id)
  ])

  const bankAccounts = accounts.filter(a => a.type