import { prisma } from '@lib/prisma'
import { CalendarEventCategory } from '@prisma/client'
import { CalendarEventCategoriesRepository } from '../calendar-event-categories-repository'

export class PrismaCalendarEventCategoriesRepository
  implements CalendarEventCategoriesRepository
{
  async findAll(): Promise<CalendarEventCategory[]> {
    // Note: Esta tabela é global e não é filtrada por casal,
    // conforme o schema
    const categories = await prisma.calendarEventCategory.findMany()
    return categories
  }
}
