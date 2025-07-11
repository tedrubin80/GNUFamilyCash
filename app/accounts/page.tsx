import { requireAuth } from '@/lib/auth'
import { getUserAccounts } from '@/lib/database'
import { AccountsList } from '@/components/AccountsList'
import { AddAccountForm } from '@/components/AddAccountForm'

export default async function AccountsPage() {
  const user = await requireAuth()
  const accounts = await getUserAccounts(user.id)

  const groupedAccounts = accounts.reduce((acc, account) => {
    if (!acc[account.type]) {
      acc[account.type] = []
    }
    acc[account.type].push(account)
    return acc
  }, {} as Record<string, typeof accounts>)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
          <p className="text-gray-600">Manage your account structure</p>
        </div>
        {(user.role === 'ADMIN' || user.role === 'USER') && (
          <AddAccountForm accounts={accounts} />
        )}
      </div>
      <AccountsList groupedAccounts={groupedAccounts} userRole={user.role} />
    </div>
  )
}
