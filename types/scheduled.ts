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

export interface ScheduledTransactionSummary {
  totalActive: number
  dueToday: number
  dueThisWeek: number
  monthlyTotal: number
  upcomingTransactions: ScheduledTransaction[]
}

export interface ExecutionResult {
  success: boolean
  transaction?: any
  execution?: ScheduledExecution
  error?: string
}