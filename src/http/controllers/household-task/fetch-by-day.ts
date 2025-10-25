import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeFetchHouseholdTasksByDayUseCase } from '@use-cases/factories/make-fetch-household-tasks-by-day-use-case'

export async function fetchByDay(request: FastifyRequest, reply: FastifyReply) {
  const fetchByDayQuerySchema = z.object({
    // z.coerce.date() converte a string da query (ex: "2025-10-25")
    // para um objeto Date.
    date: z.coerce.date(),
  })

  const { date } = fetchByDayQuerySchema.parse(request.query)
  const userId = request.user.sub

  try {
    const fetchHouseholdTasksByDayUseCase =
      makeFetchHouseholdTasksByDayUseCase()

    const { tasks } = await fetchHouseholdTasksByDayUseCase.execute({
      userId,
      date,
    })

    return reply.status(200).send({
      tasks,
    })
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send({ message: error.message })
    }
    throw error
  }
}
