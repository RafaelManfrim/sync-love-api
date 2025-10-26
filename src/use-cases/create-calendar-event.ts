import { CalendarEventsRepository } from '@repositories/calendar-events-repository'
import { UsersRepository } from '@repositories/users-repository'
import { CalendarEvent } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface CreateCalendarEventUseCaseRequest {
  authorId: number // Virá do JWT
  title: string
  description?: string | null
  startTime: Date
  endTime: Date
  isAllDay: boolean
  recurrenceRule?: string | null
  categoryId?: number | null
}

interface CreateCalendarEventUseCaseResponse {
  calendarEvent: CalendarEvent
}

export class CreateCalendarEventUseCase {
  constructor(
    private calendarEventsRepository: CalendarEventsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    authorId,
    title,
    description,
    startTime,
    endTime,
    isAllDay,
    recurrenceRule,
    categoryId,
  }: CreateCalendarEventUseCaseRequest): Promise<CreateCalendarEventUseCaseResponse> {
    // 1. Buscar o usuário para obter o couple_id
    const user = await this.usersRepository.findById(authorId)

    if (!user || !user.couple_id) {
      throw new ResourceNotFoundError()
    }

    // 2. Criar o evento no banco
    const calendarEvent = await this.calendarEventsRepository.create({
      author_id: authorId,
      couple_id: user.couple_id,
      title,
      description,
      start_time: startTime,
      end_time: endTime,
      is_all_day: isAllDay,
      recurrence_rule: recurrenceRule,
      category_id: categoryId,
    })

    return {
      calendarEvent,
    }
  }
}
