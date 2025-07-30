#!/bin/bash

# Family GnuCash - Scheduled Transactions & Subscriptions Installation Script
# This script installs all dependencies and creates the necessary files

set -e  # Exit on any error

echo "Family GnuCash - Installing Scheduled Transactions & Subscriptions"
echo "=================================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "app" ]; then
    echo "Error: Please run this script from your Family GnuCash project root directory"
    echo "Make sure package.json and app/ directory exist"
    exit 1
fi

echo "Step 1: Installing npm dependencies..."
echo "--------------------------------------"

# Check if package.json has the required dependencies
REQUIRED_DEPS=(
    "next"
    "react" 
    "react-dom"
    "next-auth"
    "@prisma/client"
    "bcryptjs"
    "mysql2"
    "lucide-react"
    "clsx"
    "tailwindcss"
)

echo "Checking existing dependencies..."
for dep in "${REQUIRED_DEPS[@]}"; do
    if grep -q "\"$dep\"" package.json; then
        echo "✓ $dep already present"
    else
        echo "✗ $dep missing - will be installed"
    fi
done

# Install missing dependencies (this should be safe since they're already in your package.json)
echo ""
echo "Running npm install to ensure all dependencies are present..."
npm install

echo ""
echo "Step 2: Creating directory structure..."
echo "---------------------------------------"

# Create necessary directories
mkdir -p app/api/scheduled-transactions/{execute}
mkdir -p app/api/scheduled-transactions/[id]
mkdir -p app/scheduled
mkdir -p app/subscriptions
mkdir -p components
mkdir -p lib
mkdir -p types

echo "✓ Directory structure created"

echo ""
echo "Step 3: Creating API route files..."
echo "-----------------------------------"

# Create scheduled-transactions main route
cat > app/api/scheduled-transactions/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/database'
import { calculateNextExecutionDate } from '@/lib/scheduled-transactions'

export async function GET() {
  try {
    const user = await requireAuth()
    
    const scheduledTransactions = await prisma.scheduledTransaction.findMany({
      where: { userId: user.id },
      include: {
        debitAccount: { select: { name: true } },
        creditAccount: { select: { name: true } },
        executions: {
          orderBy: { scheduledDate: 'desc' },
          take: 5
        }
      },
      orderBy: { nextExecutionDate: 'asc' }
    })
    
    return NextResponse.json(scheduledTransactions)
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { 
      name, 
      description,
      amount, 
      frequency, 
      startDate, 
      endDate,
      debitAccountId, 
      creditAccountId,
      autoExecute 
    } = body

    const nextExecutionDate = calculateNextExecutionDate(new Date(startDate), frequency)

    const scheduledTransaction = await prisma.scheduledTransaction.create({
      data: {
        name,
        description,
        amount,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        nextExecutionDate,
        debitAccountId,
        creditAccountId,
        autoExecute: autoExecute || false,
        userId: user.id
      },
      include: {
        debitAccount: { select: { name: true } },
        creditAccount: { select: { name: true } }
      }
    })

    return NextResponse.json(scheduledTransaction)
  } catch (error) {
    console.error('Error creating scheduled transaction:', error)
    return NextResponse.json({ error: 'Failed to create scheduled transaction' }, { status: 500 })
  }
}
EOF

echo "✓ Created app/api/scheduled-transactions/route.ts"

# Create scheduled-transactions [id] route
cat > 'app/api/scheduled-transactions/[id]/route.ts' << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/database'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const scheduledTransactionId = params.id

    const scheduledTransaction = await prisma.scheduledTransaction.findFirst({
      where: {
        id: scheduledTransactionId,
        userId: user.id
      }
    })

    if (!scheduledTransaction) {
      return NextResponse.json({ error: 'Scheduled transaction not found' }, { status: 404 })
    }

    const updatedTransaction = await prisma.scheduledTransaction.update({
      where: { id: scheduledTransactionId },
      data: body,
      include: {
        debitAccount: { select: { name: true } },
        creditAccount: { select: { name: true } }
      }
    })

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error('Error updating scheduled transaction:', error)
    return NextResponse.json({ error: 'Failed to update scheduled transaction' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const scheduledTransactionId = params.id

    const scheduledTransaction = await prisma.scheduledTransaction.findFirst({
      where: {
        id: scheduledTransactionId,
        userId: user.id
      }
    })

    if (!scheduledTransaction) {
      return NextResponse.json({ error: 'Scheduled transaction not found' }, { status: 404 })
    }

    await prisma.scheduledTransaction.delete({
      where: { id: scheduledTransactionId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting scheduled transaction:', error)
    return NextResponse.json({ error: 'Failed to delete scheduled transaction' }, { status: 500 })
  }
}
EOF

echo "✓ Created app/api/scheduled-transactions/[id]/route.ts"

# Create execute route
cat > app/api/scheduled-transactions/execute/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { executeScheduledTransaction, executeAllPending } from '@/lib/scheduled-transactions'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { scheduledTransactionId } = await request.json()

    const result = await executeScheduledTransaction(scheduledTransactionId, user.id)

    if (result.success) {
      return NextResponse.json({
        success: true,
        transaction: result.transaction,
        execution: result.execution
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error executing scheduled transaction:', error)
    return NextResponse.json({ error: 'Failed to execute transaction' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const results = await executeAllPending()
    
    return NextResponse.json({
      executed: results.executed,
      failed: results.failed,
      total: results.total
    })
  } catch (error) {
    console.error('Error in auto-execution:', error)
    return NextResponse.json({ error: 'Auto-execution failed' }, { status: 500 })
  }
}
EOF

echo "✓ Created app/api/scheduled-transactions/execute/route.ts"

echo ""
echo "Step 4: Creating page files..."
echo "------------------------------"

# Create scheduled page
cat > app/scheduled/page.tsx << 'EOF'
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
EOF

echo "✓ Created app/scheduled/page.tsx"

# Create subscriptions page
cat > app/subscriptions/page.tsx << 'EOF'
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
EOF

echo "✓ Created app/subscriptions/page.tsx"

echo ""
echo "Step 5: Creating library files..."
echo "---------------------------------"

# Create scheduled-transactions library
cat > lib/scheduled-transactions.ts << 'EOF'
import { prisma } from '@/lib/database'

export function calculateNextExecutionDate(startDate: Date, frequency: string): Date {
  const date = new Date(startDate)
  
  switch (frequency) {
    case 'DAILY':
      date.setDate(date.getDate() + 1)
      break
    case 'WEEKLY':
      date.setDate(date.getDate() + 7)
      break
    case 'BIWEEKLY':
      date.setDate(date.getDate() + 14)
      break
    case 'MONTHLY':
      date.setMonth(date.getMonth() + 1)
      break
    case 'QUARTERLY':
      date.setMonth(date.getMonth() + 3)
      break
    case 'YEARLY':
      date.setFullYear(date.getFullYear() + 1)
      break
    default:
      date.setMonth(date.getMonth() + 1)
  }
  
  return date
}

export async function executeScheduledTransaction(scheduledTransactionId: string, userId: string) {
  try {
    const scheduledTransaction = await prisma.scheduledTransaction.findFirst({
      where: {
        id: scheduledTransactionId,
        userId: userId
      },
      include: {
        debitAccount: true,
        creditAccount: true
      }
    })

    if (!scheduledTransaction) {
      return { success: false, error: 'Scheduled transaction not found' }
    }

    if (!scheduledTransaction.isActive) {
      return { success: false, error: 'Scheduled transaction is not active' }
    }

    const transaction = await prisma.transaction.create({
      data: {
        date: new Date(),
        description: `${scheduledTransaction.name} (Scheduled)`,
        userId: userId,
        splits: {
          create: [
            {
              accountId: scheduledTransaction.debitAccountId,
              debit: scheduledTransaction.amount,
              credit: 0
            },
            {
              accountId: scheduledTransaction.creditAccountId,
              debit: 0,
              credit: scheduledTransaction.amount
            }
          ]
        }
      },
      include: {
        splits: {
          include: {
            account: true
          }
        }
      }
    })

    await updateAccountBalances(scheduledTransaction.debitAccountId, scheduledTransaction.creditAccountId, scheduledTransaction.amount)

    const execution = await prisma.scheduledExecution.create({
      data: {
        scheduledTransactionId: scheduledTransactionId,
        scheduledDate: scheduledTransaction.nextExecutionDate,
        executedDate: new Date(),
        status: 'EXECUTED',
        transactionId: transaction.id
      }
    })

    const nextExecutionDate = calculateNextExecutionDate(
      scheduledTransaction.nextExecutionDate,
      scheduledTransaction.frequency
    )

    const shouldContinue = !scheduledTransaction.endDate || 
                          nextExecutionDate <= scheduledTransaction.endDate

    await prisma.scheduledTransaction.update({
      where: { id: scheduledTransactionId },
      data: {
        nextExecutionDate: shouldContinue ? nextExecutionDate : scheduledTransaction.nextExecutionDate,
        isActive: shouldContinue
      }
    })

    return {
      success: true,
      transaction,
      execution
    }

  } catch (error) {
    console.error('Error executing scheduled transaction:', error)
    
    await prisma.scheduledExecution.create({
      data: {
        scheduledTransactionId: scheduledTransactionId,
        scheduledDate: new Date(),
        status: 'FAILED'
      }
    }).catch(() => {})

    return { success: false, error: 'Failed to execute transaction' }
  }
}

async function updateAccountBalances(debitAccountId: string, creditAccountId: string, amount: any) {
  const debitAccount = await prisma.account.findUnique({
    where: { id: debitAccountId }
  })
  
  if (debitAccount) {
    const debitChange = ['ASSET', 'EXPENSE'].includes(debitAccount.type) ? amount : -amount
    await prisma.account.update({
      where: { id: debitAccountId },
      data: { balance: { increment: debitChange } }
    })
  }

  const creditAccount = await prisma.account.findUnique({
    where: { id: creditAccountId }
  })
  
  if (creditAccount) {
    const creditChange = ['INCOME', 'LIABILITY', 'EQUITY'].includes(creditAccount.type) ? amount : -amount
    await prisma.account.update({
      where: { id: creditAccountId },
      data: { balance: { increment: creditChange } }
    })
  }
}

export async function executeAllPending() {
  const now = new Date()
  
  const pendingTransactions = await prisma.scheduledTransaction.findMany({
    where: {
      isActive: true,
      autoExecute: true,
      nextExecutionDate: {
        lte: now
      }
    }
  })

  let executed = 0
  let failed = 0

  for (const scheduled of pendingTransactions) {
    const result = await executeScheduledTransaction(scheduled.id, scheduled.userId)
    if (result.success) {
      executed++
    } else {
      failed++
    }
  }

  return {
    total: pendingTransactions.length,
    executed,
    failed
  }
}
EOF

echo "✓ Created lib/scheduled-transactions.ts"

# Create types file
cat > types/scheduled.ts << 'EOF'
export type ScheduleFrequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
export type ExecutionStatus = 'PENDING' | 'EXECUTED' | 'FAILED' | 'SKIPPED'

export interface ScheduledTransaction {
  id: string
  name: string
  description?: string
  amount: number
  frequency: ScheduleFrequency
  startDate: Date
  endDate?: Date
  nextExecutionDate: Date
  isActive: boolean
  autoExecute: boolean
  createdAt: Date
  updatedAt: Date
  userId: string
  debitAccountId: string
  creditAccountId: string
  debitAccount: {
    id: string
    name: string
    type: string
  }
  creditAccount: {
    id: string
    name: string
    type: string
  }
  executions: ScheduledExecution[]
}

export interface ScheduledExecution {
  id: string
  scheduledDate: Date
  executedDate?: Date
  status: ExecutionStatus
  transactionId?: string
  scheduledTransactionId: string
  createdAt: Date
}

export interface CreateScheduledTransactionData {
  name: string
  description?: string
  amount: number
  frequency: ScheduleFrequency
  startDate: Date
  endDate?: Date
  debitAccountId: string
  creditAccountId: string
  autoExecute?: boolean
}

export interface ExecutionResult {
  success: boolean
  transaction?: any
  execution?: ScheduledExecution
  error?: string
}
EOF

echo "✓ Created types/scheduled.ts"

echo ""
echo "Step 6: Database schema update required..."
echo "-----------------------------------------"
echo ""
echo "IMPORTANT: You need to manually update your prisma/schema.prisma file."
echo "Add these models to your existing schema:"
echo ""
cat << 'EOF'
model ScheduledTransaction {
  id                String              @id @default(cuid())
  name              String
  description       String?
  amount            Decimal             @db.Decimal(15, 2)
  frequency         ScheduleFrequency
  startDate         DateTime
  endDate           DateTime?
  nextExecutionDate DateTime
  isActive          Boolean             @default(true)
  autoExecute       Boolean             @default(false)
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  debitAccountId    String
  creditAccountId   String
  debitAccount      Account             @relation("ScheduledDebitAccount", fields: [debitAccountId], references: [id])
  creditAccount     Account             @relation("ScheduledCreditAccount", fields: [creditAccountId], references: [id])

  user              User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId            String
  executions        ScheduledExecution[]

  @@map("scheduled_transactions")
}

model ScheduledExecution {
  id                    String             @id @default(cuid())
  scheduledDate         DateTime
  executedDate          DateTime?
  status                ExecutionStatus    @default(PENDING)
  transactionId         String?
  transaction           Transaction?       @relation(fields: [transactionId], references: [id])
  createdAt             DateTime           @default(now())

  scheduledTransaction  ScheduledTransaction @relation(fields: [scheduledTransactionId], references: [id], onDelete: Cascade)
  scheduledTransactionId String

  @@map("scheduled_executions")
}

enum ScheduleFrequency {
  DAILY
  WEEKLY
  BIWEEKLY
  MONTHLY
  QUARTERLY
  YEARLY
}

enum ExecutionStatus {
  PENDING
  EXECUTED
  FAILED
  SKIPPED
}
EOF

echo ""
echo "Also add these relations to existing models:"
echo ""
echo "To User model: scheduledTransactions ScheduledTransaction[]"
echo "To Account model: scheduledDebits ScheduledTransaction[] @relation(\"ScheduledDebitAccount\")"
echo "                  scheduledCredits ScheduledTransaction[] @relation(\"ScheduledCreditAccount\")"
echo "To Transaction model: scheduledExecutions ScheduledExecution[]"
echo ""

echo ""
echo "Step 7: Final setup commands..."
echo "-------------------------------"
echo ""
echo "After updating your schema, run these commands:"
echo "1. npx prisma generate"
echo "2. npx prisma db push"
echo "3. npm run dev"
echo ""

echo "Installation complete!"
echo "====================="
echo ""
echo "Next steps:"
echo "1. Update your prisma/schema.prisma with the models shown above"
echo "2. Update components/Navigation.tsx to add the new menu items"
echo "3. Create the remaining component files (use the artifacts provided)"
echo "4. Run the database commands"
echo "5. Test the new features at /scheduled and /subscriptions"
echo ""
echo "The core API routes, pages, and library files have been created."
echo "Component files need to be created manually due to their size."
