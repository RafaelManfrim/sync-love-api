import { PrismaHouseholdTasksRepository } from '@repositories/prisma/prisma-household-tasks-repository'
import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository'
import { FetchHouseholdTasksByDayUseCase } from '../fetch-household-tasks-by-day'
import { PrismaHouseholdTaskCompletionsRepository } from '@repositories/prisma/prisma-household-task-completions-repository'
import { PrismaHouseholdTaskExceptionsRepository } from '@/repositories/prisma/prisma-household-task-exceptions-repository'

export function makeFetchHouseholdTasksByDayUseCase() {
  const householdTasksRepository = new PrismaHouseholdTasksRepository()
  const householdTaskCompletionsRepository =
    new PrismaHouseholdTaskCompletionsRepository()
  const householdTaskExceptionsRepository =
    new PrismaHouseholdTaskExceptionsRepository()
  const usersRepository = new PrismaUsersRepository()

  const useCase = new FetchHouseholdTasksByDayUseCase(
    householdTasksRepository,
    householdTaskCompletionsRepository,
    householdTaskExceptionsRepository,
    usersRepository,
  )

  return useCase
}
