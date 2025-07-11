import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')

    const where: any = { userId: user.id }
    
    if (month) {
      const startDate = new Date(`${month}-01`)
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
      where.date = {
        gte: startDate,
        lte: endDate,
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        splits: {
          include: {
            account: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { date, description, splits } = body

    // Validate transaction balances
    const totalDebits = splits.reduce((sum: number, split: any) => sum + (parseFloat(split.debit) || 0), 0)
    const totalCredits = splits.reduce((sum: number, split: any) => sum + (parseFloat(split.credit) || 0), 0)
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return NextResponse.json({ error: 'Transaction must balance' }, { status: 400 })
    }

    const transaction = await prisma.transaction.create({
      data: {
        date: new Date(date),
        description,
        userId: user.id,
        splits: {
          create: splits.map((split: any) => ({
            accountId: split.accountId,
            debit: parseFloat(split.debit) || 0,
            credit: parseFloat(split.credit) || 0
          }))
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

    return NextResponse.json(transaction)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}