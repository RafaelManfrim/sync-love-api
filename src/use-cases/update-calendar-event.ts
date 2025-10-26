import { CalendarEventsRepository } from '@repositories/calendar-events-repository'
import { UsersRepository } from '@repositories/users-repository'
import { CalendarEvent } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'

interface UpdateCalendarEventUseCaseRequest {
  userId: number
  eventId: number
  data: {
    title?: string
    description?: string | null
    start_time?: Date
    end_time?: Date
    is_all_day?: boolean
    recurrence_rule?: string | null
    category_id?: number | null
  }
}

interface UpdateCalendarEventUseCaseResponse {
  calendarEvent: CalendarEvent
}

export class UpdateCalendarEventUseCase {
  constructor(
    private calendarEventsRepository: CalendarEventsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    userId,
    eventId,
    data,
  }: UpdateCalendarEventUseCaseRequest): Promise<UpdateCalendarEventUseCaseResponse> {
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

    const calendarEvent = await this.calendarEventsRepository.update(
      eventId,
      data,
    )

    return {
      calendarEvent,
    }
  }
}
