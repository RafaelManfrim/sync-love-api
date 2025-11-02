import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeDeleteHouseholdTaskUseCase } from '@use-cases/factories/make-delete-household-task-use-case'
import { ResourceNotFoundError } from '@use-cases/errors/resource-not-found-error'
import { UnauthorizedError } from '@use-cases/errors/unauthorized-error'

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteTaskParamsSchema = z.object({
    taskId: z.coerce.number().int(),
  })

  const { taskId } = deleteTaskParamsSchema.parse(request.params)
  const userId = request.user.sub

  try {
    const deleteHouseholdTaskUseCase = makeDeleteHouseholdTaskUseCase()

    await deleteHouseholdTaskUseCase.execute({
      userId,
      taskId,
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
