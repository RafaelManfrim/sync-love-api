import { UsersRepository } from '@repositories/users-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { HouseholdTaskExceptionsRepository } from '@repositories/household-task-exceptions-repository'
import { UnauthorizedError } from './errors/unauthorized-error'

interface DeleteHouseholdTaskExceptionUseCaseRequest {
  userId: number
  exceptionId: number
}

export class DeleteHouseholdTaskExceptionUseCase {
  constructor(
    private householdTaskExceptionsRepository: HouseholdTaskExceptionsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    userId,
    exceptionId,
  }: DeleteHouseholdTaskExceptionUseCaseRequest): Promise<void> {
    // 1. Validar usuário
    const user = await this.usersRepository.findById(userId)
    if (!user || !user.couple_id) {
      throw new ResourceNotFoundError()
    }

    // 2. Validar a exceção (e buscar a tarefa pai)
    const exception =
      await this.householdTaskExceptionsRepository.findById(exceptionId)
    if (!exception) {
      throw new ResourceNotFoundError()
    }

    // 3. Validar Autorização (Usuário pertence ao casal da tarefa?)
    if (exception.household_task.couple_id !== user.couple_id) {
      throw new UnauthorizedError()
    }

    // 4. Deletar
    await this.householdTaskExceptionsRepository.deleteById(exceptionId)
  }
}
