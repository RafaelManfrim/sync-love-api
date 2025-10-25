import { HouseholdTasksRepository } from '@repositories/household-tasks-repository'
import { UsersRepository } from '@repositories/users-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'

interface DeleteHouseholdTaskUseCaseRequest {
  userId: number
  taskId: number
}

export class DeleteHouseholdTaskUseCase {
  constructor(
    private householdTasksRepository: HouseholdTasksRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    userId,
    taskId,
  }: DeleteHouseholdTaskUseCaseRequest): Promise<void> {
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

    // O repositório agora cuida da transação
    await this.householdTasksRepository.softDeleteById(taskId)
  }
}
