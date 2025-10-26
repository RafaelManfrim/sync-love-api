import { CalendarEventsRepository } from '@repositories/calendar-events-repository'
import { UsersRepository } from '@repositories/users-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'
import { CalendarEventExceptionsRepository } from '@repositories/calendar-event-exceptions-repository'
import { CalendarExceptionAlreadyExistsError } from './errors/calendar-exception-already-exists-error'
import { CalendarEventException } from '@prisma/client'

interface CreateCalendarEventExceptionUseCaseRequest {
  userId: number
  eventId: number
  exceptionDate: Date // A data/hora (UTC) da ocorrência a cancelar
}

export class CreateCalendarEventExceptionUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private calendarEventsRepository: CalendarEventsRepository,
    private calendarEventExceptionsRepository: CalendarEventExceptionsRepository,
  ) {}

  async execute({
    userId,
    eventId,
    exceptionDate,
  }: CreateCalendarEventExceptionUseCaseRequest): Promise<CalendarEventException> {
    const user = await this.usersRepository.findById(userId)
    if (!user || !user.couple_id) {
      throw new ResourceNotFoundError()
    }

    const event = await this.calendarEventsRepository.findById(eventId)
    if (!event) {
      throw new ResourceNotFoundError()
    }

    if (event.couple_id !== user.couple_id) {
      throw new UnauthorizedError()
    }

    const existingException =
      await this.calendarEventExceptionsRepository.findByEventIdAndDate(
        eventId,
        exceptionDate,
      )
    if (existingException) {
      throw new CalendarExceptionAlreadyExistsError()
    }

    const exception = await this.calendarEventExceptionsRepository.create({
      calendar_event_id: eventId,
      created_by_user_id: userId,
      exception_date: exceptionDate,
    })

    return exception
  }
}
