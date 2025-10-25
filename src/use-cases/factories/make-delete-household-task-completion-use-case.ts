import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository'
import { PrismaHouseholdTaskCompletionsRepository } from '@repositories/prisma/prisma-household-task-completions-repository'
import { DeleteHouseholdTaskCompletionUseCase } from '../delete-household-task-completion'

export function makeDeleteHouseholdTaskCompletionUseCase() {
  const householdTaskCompletionsRepository =
    new PrismaHouseholdTaskCompletionsRepository()
  const usersRepository = new PrismaUsersRepository()

  const useCase = new DeleteHouseholdTaskCompletionUseCase(
    householdTaskCompletionsRepository,
    usersRepository,
  )

  return useCase
}
