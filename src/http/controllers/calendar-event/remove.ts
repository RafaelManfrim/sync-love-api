import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { ResourceNotFoundError } from '@use-cases/errors/resource-not-found-error'
import { UnauthorizedError } from '@use-cases/errors/unauthorized-error'
import { makeDeleteCalendarEventUseCase } from '@use-cases/factories/make-delete-calendar-event-use-case'

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteParamsSchema = z.object({
    eventId: z.coerce.number().int(),
  })

  const { eventId } = deleteParamsSchema.parse(request.params)
  const userId = request.user.sub

  try {
    const deleteCalendarEventUseCase = makeDeleteCalendarEventUseCase()

    await deleteCalendarEventUseCase.execute({
      userId,
      eventId,
    })

    return reply.status(204).send() // 204 No Content
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply
        .status(404)
        .send({ message: error.message, code: error.code })
    }

    if (error instanceof UnauthorizedError) {
      return reply
        .status(403)
        .send({ message: error.message, code: error.code })
    }

    throw error
  }
}
