import { PrismaCalendarEventCategoriesRepository } from '@repositories/prisma/prisma-calendar-event-categories-repository'
import { FetchCalendarEventCategoriesUseCase } from '../fetch-calendar-event-categories'

export function makeFetchCalendarEventCategoriesUseCase() {
  const categoriesRepository = new PrismaCalendarEventCategoriesRepository()

  const useCase = new FetchCalendarEventCategoriesUseCase(categoriesRepository)

  return useCase
}
