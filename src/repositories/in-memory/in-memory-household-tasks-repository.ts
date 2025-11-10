import { HouseholdTask, Prisma } from '@prisma/client'
import { HouseholdTasksRepository } from '../household-tasks-repository'

export class InMemoryHouseholdTasksRepository
  implements HouseholdTasksRepository
{
  public items: HouseholdTask[] = []

  async create(data: Prisma.HouseholdTaskUncheckedCreateInput) {
    const task: HouseholdTask = {
      id: this.items.length + 1,
      title: data.title,
      description: data.description ?? null,
      start_date: new Date(data.start_date),
      recurrence_rule: data.recurrence_rule ?? null,
      couple_id: data.couple_id,
      author_id: data.author_id,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    }

    this.items.push(task)

    return task
  }

  async findById(id: number) {
    const task = this.items.find((item) => item.id === id)

    return task || null
  }

  async findManyByCoupleId(coupleId: number) {
    return this.items.filter(
      (item) => item.couple_id === coupleId && !item.deleted_at,
    )
  }

  async findAllByCoupleIdIncludingDeleted(coupleId: number) {
    return this.items.filter((item) => item.couple_id === coupleId)
  }

  async update(id: number, data: Prisma.HouseholdTaskUncheckedUpdateInput) {
    const index = this.items.findIndex((item) => item.id === id)

    if (index === -1) {
      throw new Error('Household task not found')
    }

    const currentTask = this.items[index]

    const updatedTask: HouseholdTask = {
      ...currentTask,
      title: (data.title as string) ?? currentTask.title,
      description:
        data.description !== undefined
          ? (data.description as string | null)
          : currentTask.description,
      start_date:
        data.start_date !== undefined
          ? new Date(data.start_date as Date)
          : currentTask.start_date,
      recurrence_rule:
        data.recurrence_rule !== undefined
          ? (data.recurrence_rule as string | null)
          : currentTask.recurrence_rule,
      updated_at: new Date(),
    }

    this.items[index] = updatedTask

    return updatedTask
  }

  async softDeleteById(id: number) {
    const index = this.items.findIndex((item) => item.id === id)

    if (index >= 0) {
      this.items[index].deleted_at = new Date()
    }
  }

  async countByCoupleId(coupleId: number) {
    return this.items.filter(
      (item) => item.couple_id === coupleId && !item.deleted_at,
    ).length
  }
}
