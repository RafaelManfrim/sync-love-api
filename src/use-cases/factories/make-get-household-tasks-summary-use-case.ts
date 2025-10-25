import { PrismaHouseholdTasksRepository } from '@repositories/prisma/prisma-household-tasks-repository'
import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository'
import { PrismaHouseholdTaskCompletionsRepository } from '@repositories/prisma/prisma-household-task-completions-repository'
import { GetHouseholdTasksSummaryUseCase } from '../get-household-tasks-summary'

export function makeGetHouseholdTasksSummaryUseCase() {
  const householdTasksRepository = new PrismaHouseholdTasksRepository()
  const householdTaskCompletionsRepository =
    new PrismaHouseholdTaskCompletionsRepository()
  const usersRepository = new PrismaUsersRepository()

  const useCase = new GetHouseholdTasksSummaryUseCase(
    householdTasksRepository,
    householdTaskCompletionsRepository,
    usersRepository,
  )

  return useCase
}
