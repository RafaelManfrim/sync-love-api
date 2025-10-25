import {
  HouseholdTask,
  HouseholdTaskCompletion,
  Prisma,
  User,
} from '@prisma/client'

// Criamos um tipo que já inclui o usuário que completou a tarefa
export type HouseholdTaskCompletionWithUser = HouseholdTaskCompletion & {
  completed_by: User
}

export type MonthlyCompletionSummary = {
  completed_by_user_id: number
  _count: number
}

export type HouseholdTaskCompletionWithTask = HouseholdTaskCompletion & {
  household_task: HouseholdTask
}

export interface HouseholdTaskCompletionsRepository {
  findManyByCoupleIdAndDate(
    coupleId: number,
    date: Date,
  ): Promise<HouseholdTaskCompletionWithUser[]>

  getSummaryByMonth(
    coupleId: number,
    monthStart: Date,
    monthEnd: Date,
  ): Promise<MonthlyCompletionSummary[]>

  findByTaskIdAndDueDate(
    taskId: number,
    dueDate: Date,
  ): Promise<HouseholdTaskCompletion | null>

  create(
    data: Prisma.HouseholdTaskCompletionUncheckedCreateInput,
  ): Promise<HouseholdTaskCompletion>

  deleteByTaskIdAndDueDate(taskId: number, dueDate: Date): Promise<void>

  findById(id: number): Promise<HouseholdTaskCompletionWithTask | null>

  // [NOVO]
  deleteById(id: number): Promise<void>
}
