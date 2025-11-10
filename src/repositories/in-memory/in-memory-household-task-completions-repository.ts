import {
  HouseholdTask,
  HouseholdTaskCompletion,
  Prisma,
  User,
} from '@prisma/client'
import {
  HouseholdTaskCompletionsRepository,
  HouseholdTaskCompletionWithUser,
  HouseholdTaskCompletionWithTask,
} from '../household-task-completions-repository'

export class InMemoryHouseholdTaskCompletionsRepository
  implements HouseholdTaskCompletionsRepository
{
  public items: HouseholdTaskCompletion[] = []
  public users: User[] = []
  public tasks: HouseholdTask[] = []

  async findManyByCoupleIdAndDate(coupleId: number, date: Date) {
    const coupleTasks = this.tasks.filter((task) => task.couple_id === coupleId)
    const taskIds = coupleTasks.map((task) => task.id)

    return this.items
      .filter(
        (item) =>
          taskIds.includes(item.household_task_id) &&
          item.task_due_date.toDateString() === date.toDateString(),
      )
      .map((item) => {
        const user = this.users.find((u) => u.id === item.completed_by_user_id)
        if (!user) throw new Error('User not found')

        return {
          ...item,
          completed_by: user,
        } as HouseholdTaskCompletionWithUser
      })
  }

  async getSummaryByMonth(coupleId: number, monthStart: Date, monthEnd: Date) {
    const coupleTasks = this.tasks.filter((task) => task.couple_id === coupleId)
    const taskIds = coupleTasks.map((task) => task.id)

    const completions = this.items.filter(
      (item) =>
        taskIds.includes(item.household_task_id) &&
        item.task_due_date >= monthStart &&
        item.task_due_date <= monthEnd,
    )

    const summary: Record<number, number> = {}

    completions.forEach((completion) => {
      const userId = completion.completed_by_user_id
      summary[userId] = (summary[userId] || 0) + 1
    })

    return Object.entries(summary).map(([userId, count]) => ({
      completed_by_user_id: Number(userId),
      _count: count,
    }))
  }

  async findByTaskIdAndDueDate(taskId: number, dueDate: Date) {
    const completion = this.items.find(
      (item) =>
        item.household_task_id === taskId &&
        item.task_due_date.toDateString() === dueDate.toDateString(),
    )

    return completion || null
  }

  async create(data: Prisma.HouseholdTaskCompletionUncheckedCreateInput) {
    const completion: HouseholdTaskCompletion = {
      id: this.items.length + 1,
      household_task_id: data.household_task_id,
      completed_by_user_id: data.completed_by_user_id,
      task_due_date: new Date(data.task_due_date),
      completed_at: new Date(),
    }

    this.items.push(completion)

    return completion
  }

  async deleteByTaskIdAndDueDate(taskId: number, dueDate: Date) {
    const index = this.items.findIndex(
      (item) =>
        item.household_task_id === taskId &&
        item.task_due_date.toDateString() === dueDate.toDateString(),
    )

    if (index >= 0) {
      this.items.splice(index, 1)
    }
  }

  async findById(id: number) {
    const completion = this.items.find((item) => item.id === id)

    if (!completion) {
      return null
    }

    const task = this.tasks.find((t) => t.id === completion.household_task_id)

    if (!task) {
      return null
    }

    return {
      ...completion,
      household_task: task,
    } as HouseholdTaskCompletionWithTask
  }

  async deleteById(id: number) {
    const index = this.items.findIndex((item) => item.id === id)

    if (index >= 0) {
      this.items.splice(index, 1)
    }
  }

  async countByCoupleIdGroupedByUser(coupleId: number) {
    const coupleTasks = this.tasks.filter((task) => task.couple_id === coupleId)
    const taskIds = coupleTasks.map((task) => task.id)

    const completions = this.items.filter((item) =>
      taskIds.includes(item.household_task_id),
    )

    const summary: Record<number, number> = {}

    completions.forEach((completion) => {
      const userId = completion.completed_by_user_id
      summary[userId] = (summary[userId] || 0) + 1
    })

    return Object.entries(summary).map(([userId, count]) => ({
      completed_by_user_id: Number(userId),
      _count: count,
    }))
  }
}
