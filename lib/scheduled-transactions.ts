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
      date.setMonth(date.getMonth() + 1) // Default to monthly
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

    // Create the actual transaction
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

    // Update account balances
    await updateAccountBalances(scheduledTransaction.debitAccountId, scheduledTransaction.creditAccountId, scheduledTransaction.amount)

    // Record the execution
    const execution = await prisma.scheduledExecution.create({
      data: {
        scheduledTransactionId: scheduledTransactionId,
        scheduledDate: scheduledTransaction.nextExecutionDate,
        executedDate: new Date(),
        status: 'EXECUTED',
        transactionId: transaction.id
      }
    })

    // Calculate and update next execution date
    const nextExecutionDate = calculateNextExecutionDate(
      scheduledTransaction.nextExecutionDate,
      scheduledTransaction.frequency
    )

    // Check if we should continue (end date not reached)
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
    
    // Record failed execution
    await prisma.scheduledExecution.create({
      data: {
        scheduledTransactionId: scheduledTransactionId,
        scheduledDate: new Date(),
        status: 'FAILED'
      }
    }).catch(() => {}) // Ignore errors in error recording

    return { success: false, error: 'Failed to execute transaction' }
  }
}

async function updateAccountBalances(debitAccountId: string, creditAccountId: string, amount: any) {
  // Update debit account (increase for expenses/assets, decrease for income/liabilities)
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

  // Update credit account (decrease for expenses/assets, increase for income/liabilities)
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

export async function getUpcomingTransactions(userId: string, days: number = 30) {
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + days)

  return prisma.scheduledTransaction.findMany({
    where: {
      userId,
      isActive: true,
      nextExecutionDate: {
        lte: endDate
      }
    },
    include: {
      debitAccount: { select: { name: true } },
      creditAccount: { select: { name: true } }
    },
    orderBy: { nextExecutionDate: 'asc' }
  })
}