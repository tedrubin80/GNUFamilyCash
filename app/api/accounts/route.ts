import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/database'
import { generateAccountCode } from '@/lib/utils'

export async function GET() {
  try {
    const user = await requireAuth()
    const accounts = await prisma.account.findMany({
      where: { userId: user.id },
      orderBy: [{ type: 'asc' }, { code: 'asc' }]
    })
    
    return NextResponse.json(accounts)
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { name, type, code, parentId } = body

    // Generate code if not provided
    let accountCode = code
    if (!accountCode) {
      const existingCodes = await prisma.account.findMany({
        where: { userId: user.id },
        select: { code: true }
      })
      accountCode = generateAccountCode(type, existingCodes.map(a => a.code).filter(Boolean))
    }

    const account = await prisma.account.create({
      data: {
        name,
        type,
        code: accountCode,
        parentId: parentId || null,
        userId: user.id
      }
    })

    return NextResponse.json(account)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}

//