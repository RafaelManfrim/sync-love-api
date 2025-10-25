import { HouseholdTask, HouseholdTaskException, Prisma } from '@prisma/client'

export type HouseholdTaskExceptionWithTask = HouseholdTaskException & {
  household_task: HouseholdTask
}

export interface HouseholdTaskExceptionsRepository {
  create(
    data: Prisma.HouseholdTaskExceptionUncheckedCreateInput,
  ): Promise<HouseholdTaskException>

  findByTaskIdAndDate(
    taskId: number,
    exceptionDate: Date,
  ): Promise<HouseholdTaskException | null>

  findManyByCoupleIdAndDate(
    coupleId: number,
    date: Date,
  ): Promise<HouseholdTaskException[]>

  findById(id: number): Promise<HouseholdTaskExceptionWithTask | null>

  deleteById(id: number): Promise<void>
}
