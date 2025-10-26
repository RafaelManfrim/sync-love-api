import { FastifyRequest, FastifyReply } from 'fastify'
import { makeFetchCalendarEventCategoriesUseCase } from '@use-cases/factories/make-fetch-calendar-event-categories-use-case'

export async function fetchCategories(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const fetchCategoriesUseCase = makeFetchCalendarEventCategoriesUseCase()

  const { categories } = await fetchCategoriesUseCase.execute()

  return reply.status(200).send({ categories })
}
