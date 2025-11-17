import { CalendarEventCategory, Prisma } from '@prisma/client'
import { CalendarEventCategoriesRepository } from '../calendar-event-categories-repository'

export class InMemoryCalendarEventCategoriesRepository
  implements CalendarEventCategoriesRepository
{
  public items: CalendarEventCategory[] = []

  async findAll() {
    return this.items
  }

  async create(data: Prisma.CalendarEventCategoryCreateInput) {
    const category: CalendarEventCategory = {
      id: this.items.length + 1,
      name: data.name,
      color: data.color ?? null,
    }

    this.items.push(category)

    return category
  }
}
