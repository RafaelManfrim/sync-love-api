import { PrismaCalendarEventsRepository } from '@repositories/prisma/prisma-calendar-events-repository'
import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository'
import { CreateCalendarEventUseCase } from '../create-calendar-event'

export function makeCreateCalendarEventUseCase() {
  const calendarEventsRepository = new PrismaCalendarEventsRepository()
  const usersRepository = new PrismaUsersRepository()

  const useCase = new CreateCalendarEventUseCase(
    calendarEventsRepository,
    usersRepository,
  )

  return useCase
}
