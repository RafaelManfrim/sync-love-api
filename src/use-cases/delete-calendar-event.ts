import { CalendarEventsRepository } from '@repositories/calendar-events-repository'
import { UsersRepository } from '@repositories/users-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'

interface DeleteCalendarEventUseCaseRequest {
  userId: number
  eventId: number
}

export class DeleteCalendarEventUseCase {
  constructor(
    private calendarEventsRepository: CalendarEventsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    userId,
    eventId,
  }: DeleteCalendarEventUseCaseRequest): Promise<void> {
    const user = await this.usersRepository.findById(userId)
    if (!user || !user.couple_id) {
      throw new ResourceNotFoundError()
    }

    // Valida a posse do evento antes de deletar
    const event = await this.calendarEventsRepository.findById(eventId)
    if (!event) {
      throw new ResourceNotFoundError()
    }

    if (event.couple_id !== user.couple_id) {
      throw new UnauthorizedError()
    }

    // Deleta o evento
    await this.calendarEventsRepository.deleteById(eventId)
  }
}
