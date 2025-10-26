import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository'
import { DeleteCalendarEventExceptionUseCase } from '../delete-calendar-event-exception'
import { PrismaCalendarEventExceptionsRepository } from '@repositories/prisma/prisma-calendar-event-exceptions-repository'

export function makeDeleteCalendarEventExceptionUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const calendarEventExceptionsRepository =
    new PrismaCalendarEventExceptionsRepository()

  const useCase = new DeleteCalendarEventExceptionUseCase(
    usersRepository,
    calendarEventExceptionsRepository,
  )

  return useCase
}
