import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { ResourceNotFoundError } from '@use-cases/errors/resource-not-found-error'
import { UnauthorizedError } from '@use-cases/errors/unauthorized-error'
import { makeDeleteHouseholdTaskCompletionUseCase } from '@use-cases/factories/make-delete-household-task-completion-use-case'

export async function deleteCompletion(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const deleteCompletionParamsSchema = z.object({
    completionId: z.coerce.number().int(),
  })

  const { completionId } = deleteCompletionParamsSchema.parse(request.params)
  const userId = request.user.sub

  try {
    const deleteHouseholdTaskCompletionUseCase =
      makeDeleteHouseholdTaskCompletionUseCase()

    await deleteHouseholdTaskCompletionUseCase.execute({
      userId,
      completionId,
    })

    return reply.status(204).send() // 204 No Content
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
