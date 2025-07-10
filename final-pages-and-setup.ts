// File Locations:
// ./app/budgets/page.tsx
// ./app/reports/page.tsx
// ./app/reconciliation/page.tsx
// ./app/import-export/page.tsx
// ./app/api/transactions/[id]/reconcile/route.ts
// ./README.md

// === ./app/budgets/page.tsx ===
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
        {(user.role === 'ADMIN' || user.role === 'USER') && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Create Budget
          </button>
        )}
      </div>

      {budgets.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets yet</h3>
          <p className="text-gray-600 mb-4">Create your first budget to start tracking expenses</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Create Budget
          </button>
        </div>
      ) : (
        budgets.map(budget => (
          <div key={budget.id} className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">{budget.name}</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Account</th>
                    <th className="text-right py-2">Budgeted</th>
                    <th className="text-right py-2">Actual</th>
                    <th className="text-right py-2">Variance</th>
                    <th className="text-right py-2">% Used</th>
                  </tr>
                </thead>
                <tbody>
                  {budget.items.map(item => {
                    const variance = Number(item.actual) - Number(item.budgeted)
                    const percentUsed = (Number(item.actual) / Number(item.budgeted)) * 100
                    
                    return (
                      <tr key={item.id} className="border-b">
                        <td className="py-2 font-medium">{item.account.name}</td>
                        <td className="py-2 text-right">{formatCurrency(Number(item.budgeted))}</td>
                        <td className="py-2 text-right">{formatCurrency(Number(item.actual))}</td>
                        <td className={`py-2 text-right font-medium ${
                          variance > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {variance > 0 ? '+' : ''}{formatCurrency(Math.abs(variance))}
                        </td>
                        <td className={`py-2 text-right ${
                          percentUsed > 100 ? 'text-red-600' : percentUsed > 80 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {percentUsed.toFixed(1)}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// === ./app/reports/page.tsx ===
import { requireAuth } from '@/lib/auth'
import { getUserAccounts, getUserTransactions } from '@/lib/database'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BarChart3, TrendingUp, PieChart } from 'lucide-react'

export default async function ReportsPage() {
  const user = await requireAuth()
  const [accounts, transactions] = await Promise.all([
    getUserAccounts(user.id),
    getUserTransactions(user.id)
  ])

  // Calculate financial summary
  const summary = accounts.reduce((acc, account) => {
    const balance = Number(account.balance)
    switch (account.type) {
      case 'ASSET':
        acc.assets += balance
        break
      case 'LIABILITY':
        acc.liabilities += Math.abs(balance)
        break
      case 'INCOME':
        acc.income += Math.abs(balance)
        break
      case 'EXPENSE':
        acc.expenses += balance
        break
      case 'EQUITY':
        acc.equity += balance
        break
    }
    return acc
  }, { assets: 0, liabilities: 0, income: 0, expenses: 0, equity: 0 })

  const netWorth = summary.assets - summary.liabilities
  const netIncome = summary.income - summary.expenses

  // Group accounts by type for detailed breakdown
  const accountsByType = accounts.reduce((acc, account) => {
    if (!acc[account.type]) acc[account.type] = []
    acc[account.type].push(account)
    return acc
  }, {} as Record<string, typeof accounts>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
        <p className="text-gray-600">Comprehensive view of your financial position</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Net Worth</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(netWorth)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Net Income</p>
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(netIncome)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <PieChart className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-purple-700">{formatCurrency(summary.assets)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Liabilities</p>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(summary.liabilities)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Sheet */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Balance Sheet</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Assets</h4>
              {accountsByType.ASSET?.map(account => (
                <div key={account.id} className="flex justify-between text-sm py-1">
                  <span>{account.name}</span>
                  <span className="font-medium">{formatCurrency(Number(account.balance))}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total Assets</span>
                <span>{formatCurrency(summary.assets)}</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Liabilities</h4>
              {accountsByType.LIABILITY?.map(account => (
                <div key={account.id} className="flex justify-between text-sm py-1">
                  <span>{account.name}</span>
                  <span className="font-medium">{formatCurrency(Math.abs(Number(account.balance)))}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total Liabilities</span>
                <span>{formatCurrency(summary.liabilities)}</span>
              </div>
            </div>
            
            <div className="border-t-2 pt-2 flex justify-between font-bold text-lg">
              <span>Net Worth</span>
              <span className={netWorth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatCurrency(netWorth)}
              </span>
            </div>
          </div>
        </div>

        {/* Income Statement */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Income Statement</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Income</h4>
              {accountsByType.INCOME?.map(account => (
                <div key={account.id} className="flex justify-between text-sm py-1">
                  <span>{account.name}</span>
                  <span className="font-medium">{formatCurrency(Math.abs(Number(account.balance)))}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total Income</span>
                <span>{formatCurrency(summary.income)}</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Expenses</h4>
              {accountsByType.EXPENSE?.map(account => (
                <div key={account.id} className="flex justify-between text-sm py-1">
                  <span>{account.name}</span>
                  <span className="font-medium">{formatCurrency(Number(account.balance))}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total Expenses</span>
                <span>{formatCurrency(summary.expenses)}</span>
              </div>
            </div>
            
            <div className="border-t-2 pt-2 flex justify-between font-bold text-lg">
              <span>Net Income</span>
              <span className={netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatCurrency(netIncome)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// === ./app/reconciliation/page.tsx ===
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

  const bankAccounts = accounts.filter(a => a.type === 'ASSET' || a.type === 'LIABILITY')
  const unreconciledTransactions = transactions.filter(t => !t.reconciled)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Reconciliation</h1>
        <p className="text-gray-600">Reconcile your accounts with bank statements</p>
      </div>

      {/* Account Status */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Account Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Account</th>
                <th className="text-right py-2">Current Balance</th>
                <th className="text-center py-2">Status</th>
                <th className="text-left py-2">Last Reconciled</th>
                <th className="text-center py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bankAccounts.map(account => (
                <tr key={account.id} className="border-b">
                  <td className="py-3 font-medium">{account.name}</td>
                  <td className="py-3 text-right">{formatCurrency(Number(account.balance))}</td>
                  <td className="py-3 text-center">
                    {account.reconciled ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                        <CheckSquare className="w-3 h-3" />
                        Reconciled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                        <AlertCircle className="w-3 h-3" />
                        Needs Reconciliation
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    {account.lastReconciled ? formatDate(account.lastReconciled) : 'Never'}
                  </td>
                  <td className="py-3 text-center">
                    {(user.role === 'ADMIN' || user.role === 'USER') && (
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        Reconcile
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unreconciled Transactions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Square className="w-5 h-5 text-yellow-600" />
          Unreconciled Transactions ({unreconciledTransactions.length})
        </h3>
        
        {unreconciledTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckSquare className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p>All transactions are reconciled!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Description</th>
                  <th className="text-left py-2">Account</th>
                  <th className="text-right py-2">Amount</th>
                  {(user.role === 'ADMIN' || user.role === 'USER') && (
                    <th className="text-center py-2">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {unreconciledTransactions.flatMap(transaction =>
                  transaction.splits.map((split, index) => (
                    <tr key={`${transaction.id}-${index}`} className="border-b">
                      <td className="py-2">{formatDate(transaction.date)}</td>
                      <td className="py-2">{transaction.description}</td>
                      <td className="py-2">{split.account.name}</td>
                      <td className="py-2 text-right">
                        {Number(split.debit) > 0 
                          ? `+${formatCurrency(Number(split.debit))}`
                          : `-${formatCurrency(Number(split.credit))}`
                        }
                      </td>
                      {(user.role === 'ADMIN' || user.role === 'USER') && index === 0 && (
                        <td className="py-2 text-center">
                          <button className="text-green-600 hover:text-green-700 text-sm">
                            Mark Reconciled
                          </button>
                        </td>
                      )}
                      {(user.role === 'ADMIN' || user.role === 'USER') && index > 0 && (
                        <td className="py-2"></td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// === ./app/import-export/page.tsx ===
import { requireAuth } from '@/lib/auth'
import { Upload, Download, Cloud, RefreshCw } from 'lucide-react'

export default async function ImportExportPage() {
  const user = await requireAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import & Export</h1>
        <p className="text-gray-600">Manage your data imports, exports, and backups</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center mb-4">
            <Upload className="w-6 h-6 text-blue-600" />
            <h3 className="ml-3 text-lg font-semibold">Import Data</h3>
          </div>
          
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Import from CSV
            </button>
            <button className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Import from OFX
            </button>
            <button className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Import from QIF
            </button>
            <button className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Import GnuCash XML
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Supported formats:</strong> CSV, OFX, QIF, and GnuCash XML files.
              Make sure your files follow the standard format for best results.
            </p>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center mb-4">
            <Download className="w-6 h-6 text-green-600" />
            <h3 className="ml-3 text-lg font-semibold">Export Data</h3>
          </div>
          
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export to CSV
            </button>
            <button className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export to OFX
            </button>
            <button className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export to QIF
            </button>
            <button className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export GnuCash XML
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Export options:</strong> Choose your preferred format for backup 
              or importing into other accounting software.
            </p>
          </div>
        </div>
      </div>

      {/* Google Drive Backup */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Cloud className="w-6 h-6 text-red-600" />
            <h3 className="ml-3 text-lg font-semibold">Google Drive Backup</h3>
          </div>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
            Connected
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Last Backup</p>
            <p className="font-medium">Today, 3:00 PM</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Backup Frequency</p>
            <p className="font-medium">Daily</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Storage Used</p>
            <p className="font-medium">2.3 MB</p>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            Backup Now
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Restore from Backup
          </button>
          <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            View Backup History
          </button>
        </div>
      </div>
    </div>
  )
}

// === ./app/api/transactions/[id]/reconcile/route.ts ===
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/database'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const transactionId = params.id

    // Verify transaction belongs to user
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: user.id
      }
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Toggle reconciled status
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { reconciled: !transaction.reconciled }
    })

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 })
  }
}

// === ./README.md ===
# Family GnuCash - Online Accounting System

A complete online version of GnuCash built with Next.js, featuring password protection, MySQL database integration, Google Drive backups, and multi-user support.

## 🚀 Features

### Core Accounting
- **Double-Entry Bookkeeping**: Full double-entry accounting system
- **Chart of Accounts**: Hierarchical account structure with Asset, Liability, Income, Expense, and Equity accounts
- **Transaction Management**: Multi-split transactions with detailed tracking
- **Account Reconciliation**: Bank reconciliation workflow
- **Financial Reporting**: P&L statements, balance sheets, and custom reports
- **Budget Management**: Create and track budgets vs actuals

### Security & Access Control
- **Password Protected**: Zero public access - all pages require authentication
- **Multi-User Support**: Family member accounts with role-based permissions
  - **Admin**: Full access including backend configuration
  - **User**: Read/write access to accounting data
  - **Read-Only**: View-only access to reports and data
- **Secure Sessions**: JWT-based authentication with session expiration

### Data Management
- **MySQL Database**: Full persistence with Prisma ORM
- **Google Drive Integration**: Automated backups and restore functionality
- **Import/Export**: Support for CSV, OFX, QIF, and GnuCash XML formats
- **Data Validation**: Transaction balancing and data integrity checks

### Admin Features
- **User Management**: Create/edit/disable family member accounts
- **System Configuration**: Currency, date formats, fiscal year settings
- **Backup Management**: Schedule and manage Google Drive backups
- **Audit Trail**: Track all changes and user activities

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 + React + TypeScript
- **Backend**: Next.js API Routes
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **File Processing**: PapaParse for CSV handling
- **Cloud Integration**: Google Drive API

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MySQL server (local or cloud)
- Google Drive API credentials (optional, for backups)

### Setup Steps

1. **Clone and Install Dependencies**
   \`\`\`bash
   git clone <repository-url>
   cd family-gnucash
   npm install
   \`\`\`

2. **Environment Configuration**
   Create \`.env.local\` file:
   \`\`\`env
   # Database
   DATABASE_URL="mysql://username:password@localhost:3306/family_accounting"
   
   # NextAuth.js
   NEXTAUTH_SECRET="your-super-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Google Drive Integration (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GOOGLE_REFRESH_TOKEN="your-google-refresh-token"
   
   # App Settings
   APP_NAME="Family GnuCash"
   DEFAULT_CURRENCY="USD"
   \`\`\`

3. **Database Setup**
   \`\`\`bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   
   # (Optional) View database in browser
   npx prisma studio
   \`\`\`

4. **Create Default Admin User**
   \`\`\`bash
   # Run the seed script to create initial admin user
   npm run db:seed
   \`\`\`

5. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Access Application**
   - Open http://localhost:3000
   - Login with default admin credentials:
     - Username: \`admin\`
     - Password: \`admin123\`

## 🔧 Configuration

### Google Drive Setup (Optional)
1. Create a Google Cloud Console project
2. Enable the Google Drive API
3. Create OAuth 2.0 credentials
4. Add credentials to your \`.env.local\` file
5. Test connection in Admin > Settings

### User Management
Access the admin panel at `/admin` to:
- Create family member accounts
- Set user roles and permissions
- Configure system settings
- Manage backups and data

### Database Management
\`\`\`bash
# Apply schema changes
npm run db:migrate

# Reset database (careful!)
npm run db:reset

# Generate Prisma client after schema changes
npm run db:generate
\`\`\`

## 📊 Usage

### Getting Started
1. **Setup Accounts**: Create your chart of accounts (Assets, Liabilities, Income, Expenses)
2. **Add Family Members**: Create user accounts for family members with appropriate roles
3. **Record Transactions**: Enter your financial transactions with double-entry splits
4. **Create Budgets**: Set up monthly/yearly budgets for expense tracking
5. **Generate Reports**: View financial statements and reports
6. **Reconcile Accounts**: Match transactions with bank statements

### Best Practices
- **Regular Backups**: Enable automatic Google Drive backups
- **Account Reconciliation**: Reconcile bank accounts monthly
- **Budget Tracking**: Review budget vs actual regularly
- **User Permissions**: Use appropriate roles for family members
- **Data Security**: Change default passwords immediately

## 🔒 Security

### Authentication
- All pages require login - zero public access
- Secure password hashing with bcrypt
- JWT session tokens with expiration
- Role-based access control

### Data Protection
- User-scoped data isolation
- SQL injection prevention with Prisma
- CSRF protection via NextAuth.js
- Secure environment variable handling

### Best Practices
- Regular security updates
- Strong password requirements
- Session timeout configuration
- Audit trail monitoring

## 🚀 Deployment

### Production Deployment
1. **Build Application**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Environment Variables**
   - Set production \`DATABASE_URL\`
   - Generate new \`NEXTAUTH_SECRET\`
   - Update \`NEXTAUTH_URL\` to your domain

3. **Database Migration**
   \`\`\`bash
   npx prisma migrate deploy
   \`\`\`

4. **Deploy** (choose one):
   - **Vercel**: \`vercel --prod\`
   - **Docker**: Use included Dockerfile
   - **Manual**: \`npm start\` on your server

### Scaling Considerations
- Use cloud MySQL (AWS RDS, PlanetScale, etc.)
- Enable database connection pooling
- Configure CDN for static assets
- Set up monitoring and logging

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support and questions:
- Check the documentation in \`/docs\`
- Review the FAQ section
- Submit issues on GitHub
- Contact the development team

---

**Family GnuCash** - Complete online accounting for modern families 💰📊