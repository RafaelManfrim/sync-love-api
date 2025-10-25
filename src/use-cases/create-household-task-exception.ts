import { HouseholdTasksRepository } from '@repositories/household-tasks-repository'
import { UsersRepository } from '@repositories/users-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { HouseholdTaskCompletionsRepository } from '@repositories/household-task-completions-repository'
import { UnauthorizedError } from './errors/unauthorized-error'
import { HouseholdTaskExceptionsRepository } from '@repositories/household-task-exceptions-repository'
import { TaskExceptionAlreadyExistsError } from './errors/task-exception-already-exists-error'
import { HouseholdTaskException } from '@prisma/client'

interface CreateHouseholdTaskExceptionUseCaseRequest {
  taskId: number
  userId: number
  exceptionDate: Date // O dia (YYYY-MM-DD) a ser cancelado
}

interface CreateHouseholdTaskExceptionUseCaseResponse {
  exception: HouseholdTaskException
}

export class CreateHouseholdTaskExceptionUseCase {
  constructor(
    private householdTasksRepository: HouseholdTasksRepository,
    private householdTaskCompletionsRepository: HouseholdTaskCompletionsRepository,
    private householdTaskExceptionsRepository: HouseholdTaskExceptionsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    taskId,
    userId,
    exceptionDate,
  }: CreateHouseholdTaskExceptionUseCaseRequest): Promise<CreateHouseholdTaskExceptionUseCaseResponse> {
    // 1. Validar usuário
    const user = await this.usersRepository.findById(userId)
    if (!user || !user.couple_id) {
      throw new ResourceNotFoundError()
    }

    // 2. Validar tarefa
    const task = await this.householdTasksRepository.findById(taskId)
    if (!task) {
      throw new ResourceNotFoundError()
    }

    // 3. Validar Autorização
    if (task.couple_id !== user.couple_id) {
      throw new UnauthorizedError()
    }

    // 4. Validar se já existe uma exceção
    const existingException =
      await this.householdTaskExceptionsRepository.findByTaskIdAndDate(
        taskId,
        exceptionDate,
      )
    if (existingException) {
      throw new TaskExceptionAlreadyExistsError()
    }

    // 5. [REGRA DE NEGÓCIO]
    // Se o dia já foi concluído, o "cancelamento" (exceção)
    // tem prioridade e deve remover a conclusão.
    const existingCompletion =
      await this.householdTaskCompletionsRepository.findByTaskIdAndDueDate(
        taskId,
        exceptionDate,
      )

    if (existingCompletion) {
      await this.householdTaskCompletionsRepository.deleteByTaskIdAndDueDate(
        taskId,
        exceptionDate,
      )
    }

    // 6. Criar a exceção
    const exception = await this.householdTaskExceptionsRepository.create({
      household_task_id: taskId,
      created_by_user_id: userId,
      exception_date: exceptionDate,
    })

    return {
      exception,
    }
  }
}
