import { UsersRepository } from '@repositories/users-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { HouseholdTaskCompletionsRepository } from '@repositories/household-task-completions-repository'
import { UnauthorizedError } from './errors/unauthorized-error'

interface DeleteHouseholdTaskCompletionUseCaseRequest {
  userId: number
  completionId: number
}

export class DeleteHouseholdTaskCompletionUseCase {
  constructor(
    private householdTaskCompletionsRepository: HouseholdTaskCompletionsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    userId,
    completionId,
  }: DeleteHouseholdTaskCompletionUseCaseRequest): Promise<void> {
    // 1. Validar usuário
    const user = await this.usersRepository.findById(userId)
    if (!user || !user.couple_id) {
      throw new ResourceNotFoundError()
    }

    // 2. Validar a conclusão (e buscar a tarefa pai)
    const completion =
      await this.householdTaskCompletionsRepository.findById(completionId)
    if (!completion) {
      throw new ResourceNotFoundError()
    }

    // 3. Validar Autorização (Usuário pertence ao casal da tarefa?)
    if (completion.household_task.couple_id !== user.couple_id) {
      throw new UnauthorizedError()
    }

    // 4. Deletar
    await this.householdTaskCompletionsRepository.deleteById(completionId)
  }
}
