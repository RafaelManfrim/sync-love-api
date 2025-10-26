import { CalendarEventCategoriesRepository } from '@repositories/calendar-event-categories-repository'
import { CalendarEventCategory } from '@prisma/client'

interface FetchCalendarEventCategoriesUseCaseResponse {
  categories: CalendarEventCategory[]
}

export class FetchCalendarEventCategoriesUseCase {
  constructor(
    private categoriesRepository: CalendarEventCategoriesRepository,
  ) {}

  async execute(): Promise<FetchCalendarEventCategoriesUseCaseResponse> {
    const categories = await this.categoriesRepository.findAll()

    return {
      categories,
    }
  }
}
