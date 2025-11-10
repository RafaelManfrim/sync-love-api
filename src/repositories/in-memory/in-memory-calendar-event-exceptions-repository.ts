import { CalendarEvent, CalendarEventException, Prisma } from '@prisma/client'
import {
  CalendarEventExceptionsRepository,
  CalendarEventExceptionWithEvent,
} from '../calendar-event-exceptions-repository'

export class InMemoryCalendarEventExceptionsRepository
  implements CalendarEventExceptionsRepository
{
  public items: CalendarEventException[] = []
  public calendarEvents: CalendarEvent[] = []

  async create(data: Prisma.CalendarEventExceptionUncheckedCreateInput) {
    const calendarEventException: CalendarEventException = {
      id: this.items.length + 1,
      calendar_event_id: data.calendar_event_id,
      exception_date: new Date(data.exception_date),
      created_at: new Date(),
      created_by_user_id: data.created_by_user_id,
    }

    this.items.push(calendarEventException)

    return calendarEventException
  }

  async findByEventIdAndDate(eventId: number, exceptionDate: Date) {
    const exception = this.items.find(
      (item) =>
        item.calendar_event_id === eventId &&
        item.exception_date.toDateString() === exceptionDate.toDateString(),
    )

    return exception || null
  }

  async findManyByCoupleIdAndDateRange(
    coupleId: number,
    startDate: Date,
    endDate: Date,
  ) {
    const coupleEventIds = this.calendarEvents
      .filter((event) => event.couple_id === coupleId)
      .map((event) => event.id)

    return this.items.filter(
      (item) =>
        coupleEventIds.includes(item.calendar_event_id) &&
        item.exception_date >= startDate &&
        item.exception_date <= endDate,
    )
  }

  async findById(id: number) {
    const exception = this.items.find((item) => item.id === id)

    if (!exception) {
      return null
    }

    const event = this.calendarEvents.find(
      (e) => e.id === exception.calendar_event_id,
    )

    if (!event) {
      return null
    }

    return {
      ...exception,
      calendar_event: event,
    } as CalendarEventExceptionWithEvent
  }

  async deleteById(id: number) {
    const index = this.items.findIndex((item) => item.id === id)

    if (index >= 0) {
      this.items.splice(index, 1)
    }
  }
}
