import { PrismaCalendarEventsRepository } from '@repositories/prisma/prisma-calendar-events-repository'
import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository'
import { FetchCalendarEventsUseCase } from '../fetch-calendar-events'
import { PrismaCalendarEventExceptionsRepository } from '@/repositories/prisma/prisma-calendar-event-exceptions-repository'

export function makeFetchCalendarEventsUseCase() {
  const calendarEventsRepository = new PrismaCalendarEventsRepository()
  const usersRepository = new PrismaUsersRepository()
  const calendarEventExceptionsRepository =
    new PrismaCalendarEventExceptionsRepository()

  const useCase = new FetchCalendarEventsUseCase(
    calendarEventsRepository,
    usersRepository,
    calendarEventExceptionsRepository,
  )

  return useCase
}
