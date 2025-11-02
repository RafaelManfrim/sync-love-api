import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { ResourceNotFoundError } from '@use-cases/errors/resource-not-found-error'
import { UnauthorizedError } from '@use-cases/errors/unauthorized-error'
import { makeDeleteCalendarEventExceptionUseCase } from '@use-cases/factories/make-delete-calendar-event-exception-use-case'

export async function deleteException(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const deleteExceptionParamsSchema = z.object({
    exceptionId: z.coerce.number().int(),
  })

  const { exceptionId } = deleteExceptionParamsSchema.parse(request.params)
  const userId = request.user.sub

  try {
    const deleteCalendarEventExceptionUseCase =
      makeDeleteCalendarEventExceptionUseCase()

    await deleteCalendarEventExceptionUseCase.execute({
      userId,
      exceptionId,
    })

    return reply.status(204).send()
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
