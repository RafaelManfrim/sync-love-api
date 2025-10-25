import { HouseholdTasksRepository } from '@repositories/household-tasks-repository'
import { UsersRepository } from '@repositories/users-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { HouseholdTaskCompletionsRepository } from '@repositories/household-task-completions-repository'
import { UnauthorizedError } from './errors/unauthorized-error'
import { TaskAlreadyCompletedError } from './errors/task-already-completed-error'
import { HouseholdTaskCompletion } from '@prisma/client'

interface CompleteHouseholdTaskUseCaseRequest {
  taskId: number
  userId: number
  taskDueDate: Date // O dia para o qual esta conclusão se aplica
}

interface CompleteHouseholdTaskUseCaseResponse {
  completion: HouseholdTaskCompletion
}

export class CompleteHouseholdTaskUseCase {
  constructor(
    private householdTasksRepository: HouseholdTasksRepository,
    private householdTaskCompletionsRepository: HouseholdTaskCompletionsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    taskId,
    userId,
    taskDueDate,
  }: CompleteHouseholdTaskUseCaseRequest): Promise<CompleteHouseholdTaskUseCaseResponse> {
    // 1. Validar o usuário
    const user = await this.usersRepository.findById(userId)
    if (!user || !user.couple_id) {
      throw new ResourceNotFoundError()
    }

    // 2. Validar a tarefa
    const task = await this.householdTasksRepository.findById(taskId)
    if (!task) {
      throw new ResourceNotFoundError()
    }

    // 3. Validar Autorização (Usuário pertence ao casal da tarefa?)
    if (task.couple_id !== user.couple_id) {
      throw new UnauthorizedError()
    }

    // 4. Validar Regra de Negócio (Já foi concluída?)
    const existingCompletion =
      await this.householdTaskCompletionsRepository.findByTaskIdAndDueDate(
        taskId,
        taskDueDate,
      )

    if (existingCompletion) {
      throw new TaskAlreadyCompletedError()
    }

    // 5. Criar a conclusão
    const completion = await this.householdTaskCompletionsRepository.create({
      household_task_id: taskId,
      completed_by_user_id: userId,
      task_due_date: taskDueDate,
      // completed_at é @default(now())
    })

    return {
      completion,
    }
  }
}
