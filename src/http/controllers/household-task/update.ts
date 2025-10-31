import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeUpdateHouseholdTaskUseCase } from '@use-cases/factories/make-update-household-task-use-case'
import { ResourceNotFoundError } from '@use-cases/errors/resource-not-found-error'
import { UnauthorizedError } from '@use-cases/errors/unauthorized-error'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateTaskParamsSchema = z.object({
    taskId: z.coerce.number().int(),
  })

  // Todos os campos são opcionais para permitir atualização parcial (PATCH)
  const updateTaskBodySchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    start_date: z.coerce.date().optional(),
    recurrence_rule: z
      .string()
      .nullable()
      .optional()
      .transform((val) => (val === 'none' ? null : val)), // Converte 'none' para null
  })

  const { taskId } = updateTaskParamsSchema.parse(request.params)
  const data = updateTaskBodySchema.parse(request.body)
  const userId = request.user.sub

  try {
    const updateHouseholdTaskUseCase = makeUpdateHouseholdTaskUseCase()

    const { householdTask } = await updateHouseholdTaskUseCase.execute({
      userId,
      taskId,
      data,
    })

    return reply.status(200).send(householdTask)
  } catch (error) {
    if (
      error instanceof ResourceNotFoundError ||
      error instanceof UnauthorizedError
    ) {
      return reply.status(403).send({ message: error.message }) // 403 Forbidden/Not Found
    }

    throw error
  }
}
