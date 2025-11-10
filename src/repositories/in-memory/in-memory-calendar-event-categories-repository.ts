import { CalendarEventCategory } from '@prisma/client'
import { CalendarEventCategoriesRepository } from '../calendar-event-categories-repository'

export class InMemoryCalendarEventCategoriesRepository
  implements CalendarEventCategoriesRepository
{
  public items: CalendarEventCategory[] = []

  async findAll() {
    return this.items
  }
}
