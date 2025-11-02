import { HouseholdTasksRepository } from '@repositories/household-tasks-repository'
import { HouseholdTask } from '@prisma/client'

interface FetchHouseholdTasksUseCaseRequest {
  coupleId: number
}

interface FetchHouseholdTasksUseCaseResponse {
  tasks: HouseholdTask[]
}

export class FetchHouseholdTasksUseCase {
  constructor(private householdTasksRepository: HouseholdTasksRepository) {}

  async execute({
    coupleId,
  }: FetchHouseholdTasksUseCaseRequest): Promise<FetchHouseholdTasksUseCaseResponse> {
    const allTasksForCouple =
      await this.householdTasksRepository.findManyByCoupleId(coupleId)

    return {
      tasks: allTasksForCouple,
    }
  }
}
