import { HouseholdTasksRepository } from '@repositories/household-tasks-repository'
import { UsersRepository } from '@repositories/users-repository'
import { HouseholdTask } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'

interface UpdateHouseholdTaskUseCaseRequest {
  userId: number
  taskId: number
  data: {
    title?: string
    description?: string | null
    start_date?: Date
    recurrence_rule?: string | null
  }
}

interface UpdateHouseholdTaskUseCaseResponse {
  householdTask: HouseholdTask
}

export class UpdateHouseholdTaskUseCase {
  constructor(
    private householdTasksRepository: HouseholdTasksRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    userId,
    taskId,
    data,
  }: UpdateHouseholdTaskUseCaseRequest): Promise<UpdateHouseholdTaskUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user || !user.couple_id) {
      throw new ResourceNotFoundError()
    }

    const task = await this.householdTasksRepository.findById(taskId)
    if (!task) {
      throw new ResourceNotFoundError()
    }

    if (task.couple_id !== user.couple_id) {
      throw new UnauthorizedError()
    }

    const householdTask = await this.householdTasksRepository.update(
      taskId,
      data,
    )

    return {
      householdTask,
    }
  }
}
