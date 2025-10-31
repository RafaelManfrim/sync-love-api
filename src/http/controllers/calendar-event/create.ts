import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateCalendarEventUseCase } from '@use-cases/factories/make-create-calendar-event-use-case'
import { ResourceNotFoundError } from '@use-cases/errors/resource-not-found-error'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  // Validação dos dados do corpo da requisição
  const createCalendarEventBodySchema = z.object({
    title: z.string().min(1),
    description: z.string().nullable().optional(),
    startTime: z.coerce.date(), //
    endTime: z.coerce.date(), //
    isAllDay: z.boolean().default(false), //
    recurrenceRule: z
      .string()
      .nullable()
      .optional()
      .transform((val) => (val === 'none' ? null : val)), // Converte 'none' para null
    categoryId: z.number().int().nullable().optional(), //
  })

  const {
    title,
    description,
    startTime,
    endTime,
    isAllDay,
    recurrenceRule,
    categoryId,
  } = createCalendarEventBodySchema.parse(request.body)

  // O ID do usuário logado
  const authorId = request.user.sub

  try {
    const createCalendarEventUseCase = makeCreateCalendarEventUseCase()

    await createCalendarEventUseCase.execute({
      authorId,
      title,
      description,
      startTime,
      endTime,
      isAllDay,
      recurrenceRule,
      categoryId,
    })

    return reply.status(201).send()
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: 'User not found.' })
    }
    // Tratamento genérico caso a category_id não exista (erro de Foreign Key)
    if (error instanceof Error && error.message.includes('foreign key')) {
      return reply.status(400).send({ message: 'Invalid category_id.' })
    }

    throw error
  }
}
