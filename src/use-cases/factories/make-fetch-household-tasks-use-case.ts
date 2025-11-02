import { PrismaHouseholdTasksRepository } from '@repositories/prisma/prisma-household-tasks-repository'
import { FetchHouseholdTasksUseCase } from '../fetch-household-taks'

export function makeFetchHouseholdTasksUseCase() {
  const householdTasksRepository = new PrismaHouseholdTasksRepository()

  const useCase = new FetchHouseholdTasksUseCase(householdTasksRepository)

  return useCase
}
