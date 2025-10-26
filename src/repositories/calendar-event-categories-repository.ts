import { CalendarEventCategory } from '@prisma/client'

export interface CalendarEventCategoriesRepository {
  findAll(): Promise<CalendarEventCategory[]>
}
