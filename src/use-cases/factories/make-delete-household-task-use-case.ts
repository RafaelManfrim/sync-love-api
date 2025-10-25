import { PrismaHouseholdTasksRepository } from '@repositories/prisma/prisma-household-tasks-repository'
import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository'
import { DeleteHouseholdTaskUseCase } from '../delete-household-task'

export function makeDeleteHouseholdTaskUseCase() {
  const householdTasksRepository = new PrismaHouseholdTasksRepository()
  const usersRepository = new PrismaUsersRepository()

  const useCase = new DeleteHouseholdTaskUseCase(
    householdTasksRepository,
    usersRepository,
  )

  return useCase
}
