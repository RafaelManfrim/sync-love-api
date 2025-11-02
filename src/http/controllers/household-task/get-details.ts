import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { ResourceNotFoundError } from '@use-cases/errors/resource-not-found-error'
import { UnauthorizedError } from '@use-cases/errors/unauthorized-error'
import { makeGetHouseholdTaskDetailsUseCase } from '@use-cases/factories/make-get-household-task-details-use-case'

export async function getDetails(request: FastifyRequest, reply: FastifyReply) {
  const getDetailsParamsSchema = z.object({
    taskId: z.coerce.number().int(),
  })

  const { taskId } = getDetailsParamsSchema.parse(request.params)
  const userId = request.user.sub

  try {
    const getHouseholdTaskDetailsUseCase = makeGetHouseholdTaskDetailsUseCase()

    const { task } = await getHouseholdTaskDetailsUseCase.execute({
      userId,
      taskId,
    })

    return reply.status(200).send({ task }) // Retorna o objeto da tarefa
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply
        .status(404)
        .send({ message: error.message, code: error.code }) // 404 Not Found
    }
    if (error instanceof UnauthorizedError) {
      return reply
        .status(403)
        .send({ message: error.message, code: error.code }) // 403 Forbidden
    }

    throw error
  }
}
