import { PrismaHouseholdTasksRepository } from '@repositories/prisma/prisma-household-tasks-repository'
import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository'
import { UpdateHouseholdTaskUseCase } from '../update-household-task'

export function makeUpdateHouseholdTaskUseCase() {
  const householdTasksRepository = new PrismaHouseholdTasksRepository()
  const usersRepository = new PrismaUsersRepository()

  const useCase = new UpdateHouseholdTaskUseCase(
    householdTasksRepository,
    usersRepository,
  )

  return useCase
}
