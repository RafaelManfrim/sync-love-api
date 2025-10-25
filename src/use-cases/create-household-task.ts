import { HouseholdTasksRepository } from '@repositories/household-tasks-repository'
import { UsersRepository } from '@repositories/users-repository'
import { HouseholdTask } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface CreateHouseholdTaskUseCaseRequest {
  authorId: number
  title: string
  description?: string | null
  startDate: Date
  recurrenceRule?: string | null
}

interface CreateHouseholdTaskUseCaseResponse {
  householdTask: HouseholdTask
}

export class CreateHouseholdTaskUseCase {
  constructor(
    private householdTasksRepository: HouseholdTasksRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    authorId,
    title,
    description,
    startDate,
    recurrenceRule,
  }: CreateHouseholdTaskUseCaseRequest): Promise<CreateHouseholdTaskUseCaseResponse> {
    const user = await this.usersRepository.findById(authorId)

    if (!user || !user.couple_id) {
      throw new ResourceNotFoundError()
    }

    const householdTask = await this.householdTasksRepository.create({
      author_id: authorId,
      couple_id: user.couple_id,
      title,
      description,
      start_date: startDate,
      recurrence_rule: recurrenceRule,
    })

    return {
      householdTask,
    }
  }
}
