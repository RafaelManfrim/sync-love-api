import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository'
import { DeleteHouseholdTaskExceptionUseCase } from '../delete-household-task-exception'
import { PrismaHouseholdTaskExceptionsRepository } from '@repositories/prisma/prisma-household-task-exceptions-repository'

export function makeDeleteHouseholdTaskExceptionUseCase() {
  const householdTaskExceptionsRepository =
    new PrismaHouseholdTaskExceptionsRepository()
  const usersRepository = new PrismaUsersRepository()

  const useCase = new DeleteHouseholdTaskExceptionUseCase(
    householdTaskExceptionsRepository,
    usersRepository,
  )

  return useCase
}
