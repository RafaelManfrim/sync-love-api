import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeGetHouseholdTasksSummaryUseCase } from '@use-cases/factories/make-get-household-tasks-summary-use-case'

export async function summary(request: FastifyRequest, reply: FastifyReply) {
  const summaryQuerySchema = z.object({
    // Converte a string da query "YYYY" para número
    year: z.coerce.number().int().min(2000).max(2100),
    // Converte a string da query "MM" para número
    month: z.coerce.number().int().min(1).max(12),
  })

  const { year, month } = summaryQuerySchema.parse(request.query)
  const userId = request.user.sub

  try {
    const getHouseholdTasksSummaryUseCase =
      makeGetHouseholdTasksSummaryUseCase()

    const { summary } = await getHouseholdTasksSummaryUseCase.execute({
      userId,
      year,
      month,
    })

    return reply.status(200).send(summary)
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send({ message: error.message })
    }
    throw error
  }
}
