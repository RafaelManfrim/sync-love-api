import { UsersRepository } from '@repositories/users-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'
import { CalendarEventExceptionsRepository } from '@repositories/calendar-event-exceptions-repository'

interface DeleteCalendarEventExceptionUseCaseRequest {
  userId: number
  exceptionId: number
}

export class DeleteCalendarEventExceptionUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private calendarEventExceptionsRepository: CalendarEventExceptionsRepository,
  ) {}

  async execute({
    userId,
    exceptionId,
  }: DeleteCalendarEventExceptionUseCaseRequest): Promise<void> {
    const user = await this.usersRepository.findById(userId)
    if (!user || !user.couple_id) {
      throw new ResourceNotFoundError()
    }

    const exception =
      await this.calendarEventExceptionsRepository.findById(exceptionId)
    if (!exception) {
      throw new ResourceNotFoundError()
    }

    if (exception.calendar_event.couple_id !== user.couple_id) {
      throw new UnauthorizedError()
    }

    await this.calendarEventExceptionsRepository.deleteById(exceptionId)
  }
}
