import { prisma } from '@lib/prisma'
import { HouseholdTask, Prisma } from '@prisma/client'
import { HouseholdTasksRepository } from '../household-tasks-repository'

export class PrismaHouseholdTasksRepository
  implements HouseholdTasksRepository
{
  async create(
    data: Prisma.HouseholdTaskUncheckedCreateInput,
  ): Promise<HouseholdTask> {
    const householdTask = await prisma.householdTask.create({
      data,
    })

    return householdTask
  }

  async findById(id: number): Promise<HouseholdTask | null> {
    const householdTask = await prisma.householdTask.findUnique({
      where: {
        id,
      },
    })
    return householdTask
  }

  async findManyByCoupleId(coupleId: number): Promise<HouseholdTask[]> {
    const tasks = await prisma.householdTask.findMany({
      where: {
        couple_id: coupleId,
        deleted_at: null,
      },
    })
    return tasks
  }

  async findAllByCoupleIdIncludingDeleted(
    coupleId: number,
  ): Promise<HouseholdTask[]> {
    const tasks = await prisma.householdTask.findMany({
      where: {
        couple_id: coupleId,
      },
    })
    return tasks
  }

  async update(
    id: number,
    data: Prisma.HouseholdTaskUncheckedUpdateInput,
  ): Promise<HouseholdTask> {
    const householdTask = await prisma.householdTask.update({
      where: {
        id,
      },
      data,
    })
    return householdTask
  }

  async softDeleteById(id: number): Promise<void> {
    await prisma.householdTask.update({
      where: {
        id,
      },
      data: {
        deleted_at: new Date(),
      },
    })
  }

  async countByCoupleId(coupleId: number): Promise<number> {
    const count = await prisma.householdTask.count({
      where: {
        couple_id: coupleId,
        deleted_at: null, // Ignora tarefas soft-deletadas
      },
    })
    return count
  }
}
