import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { ResourceNotFoundError } from '@use-cases/errors/resource-not-found-error'
import { UnauthorizedError } from '@use-cases/errors/unauthorized-error'
import { makeUpdateCalendarEventUseCase } from '@use-cases/factories/make-update-calendar-event-use-case'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateParamsSchema = z.object({
    eventId: z.coerce.number().int(),
  })

  // Todos os campos são opcionais
  const updateBodySchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    start_time: z.coerce.date().optional(),
    end_time: z.coerce.date().optional(),
    is_all_day: z.boolean().optional(),
    recurrence_rule: z
      .string()
      .nullable()
      .optional()
      .transform((val) => (val === 'none' ? null : val)), // Converte 'none' para null
    category_id: z.number().int().nullable().optional(),
  })

  const { eventId } = updateParamsSchema.parse(request.params)
  const data = updateBodySchema.parse(request.body)
  const userId = request.user.sub

  try {
    const updateCalendarEventUseCase = makeUpdateCalendarEventUseCase()

    const { calendarEvent } = await updateCalendarEventUseCase.execute({
      userId,
      eventId,
      data,
    })

    return reply.status(200).send(calendarEvent)
  } catch (error) {
    if (
      error instanceof ResourceNotFoundError ||
      error instanceof UnauthorizedError
    ) {
      return reply.status(403).send({ message: error.message })
    }

    throw error
  }
}
