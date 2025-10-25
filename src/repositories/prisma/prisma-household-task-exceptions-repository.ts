import { prisma } from '@lib/prisma'
import { HouseholdTaskException, Prisma } from '@prisma/client'
import {
  HouseholdTaskExceptionsRepository,
  HouseholdTaskExceptionWithTask,
} from '../household-task-exceptions-repository'

export class PrismaHouseholdTaskExceptionsRepository
  implements HouseholdTaskExceptionsRepository
{
  async create(
    data: Prisma.HouseholdTaskExceptionUncheckedCreateInput,
  ): Promise<HouseholdTaskException> {
    const exception = await prisma.householdTaskException.create({
      data,
    })
    return exception
  }

  async findByTaskIdAndDate(
    taskId: number,
    exceptionDate: Date,
  ): Promise<HouseholdTaskException | null> {
    const exception = await prisma.householdTaskException.findUnique({
      where: {
        household_task_id_exception_date: {
          household_task_id: taskId,
          exception_date: exceptionDate,
        },
      },
    })
    return exception
  }

  async findManyByCoupleIdAndDate(
    coupleId: number,
    date: Date,
  ): Promise<HouseholdTaskException[]> {
    const exceptions = await prisma.householdTaskException.findMany({
      where: {
        exception_date: date,
        household_task: {
          couple_id: coupleId,
        },
      },
    })
    return exceptions
  }

  async findById(id: number): Promise<HouseholdTaskExceptionWithTask | null> {
    const exception = await prisma.householdTaskException.findUnique({
      where: {
        id,
      },
      include: {
        household_task: true, // Inclui a tarefa pai para verificação
      },
    })
    return exception
  }

  async deleteById(id: number): Promise<void> {
    await prisma.householdTaskException.delete({
      where: {
        id,
      },
    })
  }
}
