import {
  CalendarEvent,
  CalendarEventCategory,
  Prisma,
  User,
} from '@prisma/client'
import {
  CalendarEventsRepository,
  CalendarEventWithDetails,
} from '../calendar-events-repository'

export class InMemoryCalendarEventsRepository
  implements CalendarEventsRepository
{
  public items: CalendarEvent[] = []
  public users: User[] = []
  public categories: CalendarEventCategory[] = []

  async create(data: Prisma.CalendarEventUncheckedCreateInput) {
    const calendarEvent: CalendarEvent = {
      id: this.items.length + 1,
      title: data.title,
      description: data.description ?? null,
      start_time: new Date(data.start_time),
      end_time: new Date(data.end_time),
      is_all_day: data.is_all_day ?? false,
      recurrence_rule: data.recurrence_rule ?? null,
      category_id: data.category_id ?? null,
      couple_id: data.couple_id,
      author_id: data.author_id,
      created_at: new Date(),
      updated_at: new Date(),
    }

    this.items.push(calendarEvent)

    return calendarEvent
  }

  async findManyByCoupleId(coupleId: number) {
    return this.items
      .filter((item) => item.couple_id === coupleId)
      .map((item) => {
        const author = this.users.find((user) => user.id === item.author_id)
        const category = item.category_id
          ? this.categories.find((cat) => cat.id === item.category_id)
          : null

        if (!author) {
          throw new Error('Author not found')
        }

        return {
          ...item,
          author,
          category: category || null,
        } as CalendarEventWithDetails
      })
  }

  async findById(id: number) {
    const event = this.items.find((item) => item.id === id)

    return event || null
  }

  async update(id: number, data: Prisma.CalendarEventUncheckedUpdateInput) {
    const index = this.items.findIndex((item) => item.id === id)

    if (index === -1) {
      throw new Error('Calendar event not found')
    }

    const currentEvent = this.items[index]

    const updatedEvent: CalendarEvent = {
      ...currentEvent,
      title: (data.title as string) ?? currentEvent.title,
      description:
        data.description !== undefined
          ? (data.description as string | null)
          : currentEvent.description,
      start_time:
        data.start_time !== undefined
          ? new Date(data.start_time as Date)
          : currentEvent.start_time,
      end_time:
        data.end_time !== undefined
          ? new Date(data.end_time as Date)
          : currentEvent.end_time,
      is_all_day:
        data.is_all_day !== undefined
          ? (data.is_all_day as boolean)
          : currentEvent.is_all_day,
      recurrence_rule:
        data.recurrence_rule !== undefined
          ? (data.recurrence_rule as string | null)
          : currentEvent.recurrence_rule,
      category_id:
        data.category_id !== undefined
          ? (data.category_id as number | null)
          : currentEvent.category_id,
      updated_at: new Date(),
    }

    this.items[index] = updatedEvent

    return updatedEvent
  }

  async deleteById(id: number) {
    const index = this.items.findIndex((item) => item.id === id)

    if (index >= 0) {
      this.items.splice(index, 1)
    }
  }

  async countByCoupleId(coupleId: number) {
    return this.items.filter((item) => item.couple_id === coupleId).length
  }
}
