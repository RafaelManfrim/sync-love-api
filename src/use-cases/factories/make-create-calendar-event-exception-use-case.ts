import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository'
import { CreateCalendarEventExceptionUseCase } from '../create-calendar-event-exception'
import { PrismaCalendarEventsRepository } from '@repositories/prisma/prisma-calendar-events-repository'
import { PrismaCalendarEventExceptionsRepository } from '@repositories/prisma/prisma-calendar-event-exceptions-repository'

export function makeCreateCalendarEventExceptionUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const calendarEventsRepository = new PrismaCalendarEventsRepository()
  const calendarEventExceptionsRepository =
    new PrismaCalendarEventExceptionsRepository()

  const useCase = new CreateCalendarEventExceptionUseCase(
    usersRepository,
    calendarEventsRepository,
    calendarEventExceptionsRepository,
  )

  return useCase
}
