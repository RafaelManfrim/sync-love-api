import { PrismaHouseholdTasksRepository } from '@repositories/prisma/prisma-household-tasks-repository'
import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository'
import { PrismaHouseholdTaskCompletionsRepository } from '@repositories/prisma/prisma-household-task-completions-repository'
import { CompleteHouseholdTaskUseCase } from '../complete-household-task'

export function makeCompleteHouseholdTaskUseCase() {
  const householdTasksRepository = new PrismaHouseholdTasksRepository()
  const householdTaskCompletionsRepository =
    new PrismaHouseholdTaskCompletionsRepository()
  const usersRepository = new PrismaUsersRepository()

  const useCase = new CompleteHouseholdTaskUseCase(
    householdTasksRepository,
    householdTaskCompletionsRepository,
    usersRepository,
  )

  return useCase
}
