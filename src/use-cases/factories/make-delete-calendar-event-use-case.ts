import { PrismaCalendarEventsRepository } from '@repositories/prisma/prisma-calendar-events-repository'
import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository'
import { DeleteCalendarEventUseCase } from '../delete-calendar-event'

export function makeDeleteCalendarEventUseCase() {
  const calendarEventsRepository = new PrismaCalendarEventsRepository()
  const usersRepository = new PrismaUsersRepository()

  const useCase = new DeleteCalendarEventUseCase(
    calendarEventsRepository,
    usersRepository,
  )

  return useCase
}
