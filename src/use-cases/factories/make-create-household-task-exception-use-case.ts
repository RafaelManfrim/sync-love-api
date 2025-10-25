import { PrismaHouseholdTasksRepository } from '@repositories/prisma/prisma-household-tasks-repository'
import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository'
import { PrismaHouseholdTaskCompletionsRepository } from '@repositories/prisma/prisma-household-task-completions-repository'
import { CreateHouseholdTaskExceptionUseCase } from '../create-household-task-exception'
import { PrismaHouseholdTaskExceptionsRepository } from '@repositories/prisma/prisma-household-task-exceptions-repository'

export function makeCreateHouseholdTaskExceptionUseCase() {
  const householdTasksRepository = new PrismaHouseholdTasksRepository()
  const householdTaskCompletionsRepository =
    new PrismaHouseholdTaskCompletionsRepository()
  const householdTaskExceptionsRepository =
    new PrismaHouseholdTaskExceptionsRepository()
  const usersRepository = new PrismaUsersRepository()

  const useCase = new CreateHouseholdTaskExceptionUseCase(
    householdTasksRepository,
    householdTaskCompletionsRepository,
    householdTaskExceptionsRepository,
    usersRepository,
  )

  return useCase
}
