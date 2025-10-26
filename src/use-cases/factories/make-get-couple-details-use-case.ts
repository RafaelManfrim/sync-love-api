import { PrismaCouplesRepository } from '@/repositories/prisma/prisma-couples-repository'
import { GetCoupleDetailsUseCase } from '../get-couple-details'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { PrismaHouseholdTasksRepository } from '@/repositories/prisma/prisma-household-tasks-repository'
import { PrismaHouseholdTaskCompletionsRepository } from '@/repositories/prisma/prisma-household-task-completions-repository'
import { PrismaCalendarEventsRepository } from '@/repositories/prisma/prisma-calendar-events-repository'

export function makeGetCoupleDetailsUseCase() {
  const couplesRepository = new PrismaCouplesRepository()
  const usersRepository = new PrismaUsersRepository()
  const householdTasksRepository = new PrismaHouseholdTasksRepository()
  const householdTaskCompletionsRepository =
    new PrismaHouseholdTaskCompletionsRepository()
  const calendarEventsRepository = new PrismaCalendarEventsRepository()

  const useCase = new GetCoupleDetailsUseCase(
    couplesRepository,
    usersRepository,
    householdTasksRepository,
    householdTaskCompletionsRepository,
    calendarEventsRepository,
  )

  return useCase
}
