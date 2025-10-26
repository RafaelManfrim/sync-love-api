import { PrismaCalendarEventsRepository } from '@repositories/prisma/prisma-calendar-events-repository'
import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository'
import { UpdateCalendarEventUseCase } from '../update-calendar-event'

export function makeUpdateCalendarEventUseCase() {
  const calendarEventsRepository = new PrismaCalendarEventsRepository()
  const usersRepository = new PrismaUsersRepository()

  const useCase = new UpdateCalendarEventUseCase(
    calendarEventsRepository,
    usersRepository,
  )

  return useCase
}
