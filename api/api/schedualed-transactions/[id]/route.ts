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

    // Verify ownership
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

    // Verify ownership
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