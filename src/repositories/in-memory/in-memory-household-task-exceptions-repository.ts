import { HouseholdTask, HouseholdTaskException, Prisma } from '@prisma/client'
import {
  HouseholdTaskExceptionsRepository,
  HouseholdTaskExceptionWithTask,
} from '../household-task-exceptions-repository'

export class InMemoryHouseholdTaskExceptionsRepository
  implements HouseholdTaskExceptionsRepository
{
  public items: HouseholdTaskException[] = []
  public tasks: HouseholdTask[] = []

  async create(data: Prisma.HouseholdTaskExceptionUncheckedCreateInput) {
    const exception: HouseholdTaskException = {
      id: this.items.length + 1,
      household_task_id: data.household_task_id,
      exception_date: new Date(data.exception_date),
      created_at: new Date(),
      created_by_user_id: data.created_by_user_id,
    }

    this.items.push(exception)

    return exception
  }

  async findByTaskIdAndDate(taskId: number, exceptionDate: Date) {
    const exception = this.items.find(
      (item) =>
        item.household_task_id === taskId &&
        item.exception_date.toDateString() === exceptionDate.toDateString(),
    )

    return exception || null
  }

  async findManyByCoupleIdAndDate(coupleId: number, date: Date) {
    const coupleTasks = this.tasks.filter((task) => task.couple_id === coupleId)
    const taskIds = coupleTasks.map((task) => task.id)

    return this.items.filter(
      (item) =>
        taskIds.includes(item.household_task_id) &&
        item.exception_date.toDateString() === date.toDateString(),
    )
  }

  async findById(id: number) {
    const exception = this.items.find((item) => item.id === id)

    if (!exception) {
      return null
    }

    const task = this.tasks.find((t) => t.id === exception.household_task_id)

    if (!task) {
      return null
    }

    return {
      ...exception,
      household_task: task,
    } as HouseholdTaskExceptionWithTask
  }

  async deleteById(id: number) {
    const index = this.items.findIndex((item) => item.id === id)

    if (index >= 0) {
      this.items.splice(index, 1)
    }
  }
}
