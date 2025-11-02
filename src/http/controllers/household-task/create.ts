import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateHouseholdTaskUseCase } from '@use-cases/factories/make-create-household-task-use-case'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createHouseholdTaskBodySchema = z.object({
    title: z.string().min(1),
    description: z.string().nullable().optional(),
    startDate: z.coerce.date(), // 'z.coerce.date()' converte a string JSON para Date
    recurrenceRule: z
      .string()
      .nullable()
      .optional()
      .transform((val) => (val === 'none' ? null : val)), // Converte 'none' para null
  })

  const { title, description, startDate, recurrenceRule } =
    createHouseholdTaskBodySchema.parse(request.body)

  // O 'request.user.sub' é o ID do usuário injetado pelo middleware 'verifyJwt'
  const authorId = request.user.sub

  const createHouseholdTaskUseCase = makeCreateHouseholdTaskUseCase()

  try {
    await createHouseholdTaskUseCase.execute({
      authorId,
      title,
      description,
      startDate,
      recurrenceRule,
    })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply
        .status(404)
        .send({ message: error.message, code: error.code })
    }

    throw error
  }

  return reply.status(201).send()
}
