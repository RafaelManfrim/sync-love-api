import { PrismaHouseholdTasksRepository } from '@repositories/prisma/prisma-household-tasks-repository'
import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository'
import { GetHouseholdTaskDetailsUseCase } from '../get-household-task-details'

export function makeGetHouseholdTaskDetailsUseCase() {
  const householdTasksRepository = new PrismaHouseholdTasksRepository()
  const usersRepository = new PrismaUsersRepository()

  const useCase = new GetHouseholdTaskDetailsUseCase(
    householdTasksRepository,
    usersRepository,
  )

  return useCase
}
