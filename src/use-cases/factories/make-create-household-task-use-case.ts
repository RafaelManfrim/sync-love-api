import { PrismaHouseholdTasksRepository } from '@repositories/prisma/prisma-household-tasks-repository'
import { CreateHouseholdTaskUseCase } from '../create-household-task'
import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository'

export function makeCreateHouseholdTaskUseCase() {
  const householdTasksRepository = new PrismaHouseholdTasksRepository()
  const usersRepository = new PrismaUsersRepository()

  const useCase = new CreateHouseholdTaskUseCase(
    householdTasksRepository,
    usersRepository,
  )

  return useCase
}
