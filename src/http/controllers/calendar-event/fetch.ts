import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeFetchCalendarEventsUseCase } from '@use-cases/factories/make-fetch-calendar-events-use-case'
import { ResourceNotFoundError } from '@use-cases/errors/resource-not-found-error'

export async function fetch(request: FastifyRequest, reply: FastifyReply) {
  // Validação dos query params
  const fetchCalendarEventsQuerySchema = z.object({
    startDate: z.coerce.date(), // Converte a string "YYYY-MM-DD" para Date
    endDate: z.coerce.date(),
  })

  const { startDate, endDate } = fetchCalendarEventsQuerySchema.parse(
    request.query,
  )

  const userId = request.user.sub

  try {
    const fetchCalendarEventsUseCase = makeFetchCalendarEventsUseCase()

    const { events } = await fetchCalendarEventsUseCase.execute({
      userId,
      startDate,
      endDate,
    })

    return reply.status(200).send({ events })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: 'User not found.' })
    }

    throw error
  }
}
