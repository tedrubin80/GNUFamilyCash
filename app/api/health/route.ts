// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'family-gnucash',
    database: 'unknown',
    checks: {
      api: true,
      database: false
    }
  }

  // Check database connection with timeout
  try {
    // Set a timeout for the database check
    const dbCheckPromise = prisma.$queryRaw`SELECT 1 as connected`
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database timeout')), 5000)
    )
    
    await Promise.race([dbCheckPromise, timeoutPromise])
    
    health.database = 'connected'
    health.checks.database = true
  } catch (error) {
    // Don't fail the health check if database is not ready
    // This allows the app to start even if DB is still initializing
    health.database = 'disconnected'
    health.checks.database = false
    
    // Log the error but don't fail
    console.error('Health check - Database connection failed:', error)
  }

  // Always return 200 OK if the API is responding
  // This prevents container restart loops during initialization
  return NextResponse.json(health, { status: 200 })
}