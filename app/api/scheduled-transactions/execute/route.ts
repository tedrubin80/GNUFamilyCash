import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { executeScheduledTransaction } from '@/lib/scheduled-transactions'

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

// Auto-execute endpoint (called by cron job)
export async function GET() {
  try {
    // This would be called by a cron job or scheduled task
    const results = await executeAllPendingTransactions()
    
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

async function executeAllPendingTransactions() {
  const { executeAllPending } = await import('@/lib/scheduled-transactions')
  return executeAllPending()
}