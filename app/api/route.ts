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