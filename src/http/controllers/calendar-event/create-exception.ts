import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { ResourceNotFoundError } from '@use-cases/errors/resource-not-found-error'
import { UnauthorizedError } from '@use-cases/errors/unauthorized-error'
import { makeCreateCalendarEventExceptionUseCase } from '@use-cases/factories/make-create-calendar-event-exception-use-case'
import { CalendarExceptionAlreadyExistsError } from '@use-cases/errors/calendar-exception-already-exists-error'

export async function createException(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createExceptionParamsSchema = z.object({
    eventId: z.coerce.number().int(),
  })

  const createExceptionBodySchema = z.object({
    // A data/hora exata (em UTC) da ocorrência que o usuário clicou
    exceptionDate: z.coerce.date(),
  })

  const { eventId } = createExceptionParamsSchema.parse(request.params)
  const { exceptionDate } = createExceptionBodySchema.parse(request.body)
  const userId = request.user.sub

  try {
    const createCalendarEventExceptionUseCase =
      makeCreateCalendarEventExceptionUseCase()

    await createCalendarEventExceptionUseCase.execute({
      userId,
      eventId,
      exceptionDate,
    })

    return reply.status(201).send()
  } catch (error) {
    if (error instanceof CalendarExceptionAlreadyExistsError) {
      return reply
        .status(409)
        .send({ message: error.message, code: error.code })
    }

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
