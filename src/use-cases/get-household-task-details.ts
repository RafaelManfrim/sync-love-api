import { HouseholdTasksRepository } from '@repositories/household-tasks-repository'
import { UsersRepository } from '@repositories/users-repository'
import { HouseholdTask } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'

interface GetHouseholdTaskDetailsUseCaseRequest {
  userId: number
  taskId: number
}

interface GetHouseholdTaskDetailsUseCaseResponse {
  task: HouseholdTask
}

export class GetHouseholdTaskDetailsUseCase {
  constructor(
    private householdTasksRepository: HouseholdTasksRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    userId,
    taskId,
  }: GetHouseholdTaskDetailsUseCaseRequest): Promise<GetHouseholdTaskDetailsUseCaseResponse> {
    // 1. Validar usuário
    const user = await this.usersRepository.findById(userId)
    if (!user || !user.couple_id) {
      throw new ResourceNotFoundError()
    }

    // 2. Validar tarefa
    const task = await this.householdTasksRepository.findById(taskId)

    // Se a tarefa não existe OU foi soft-deletada, retorne Não Encontrado
    if (!task || task.deleted_at) {
      throw new ResourceNotFoundError()
    }

    // 3. Validar Autorização
    if (task.couple_id !== user.couple_id) {
      throw new UnauthorizedError()
    }

    return {
      task,
    }
  }
}
