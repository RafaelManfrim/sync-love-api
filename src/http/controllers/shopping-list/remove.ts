import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeDeleteShoppingListUseCase } from '@use-cases/factories/make-delete-shopping-list-use-case'
import { ResourceNotFoundError } from '@use-cases/errors/resource-not-found-error'
import { UnauthorizedError } from '@use-cases/errors/unauthorized-error'

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteParamsSchema = z.object({
    listId: z.coerce.number().int(),
  })

  const { listId } = deleteParamsSchema.parse(request.params)
  const userId = request.user.sub

  try {
    const deleteShoppingListUseCase = makeDeleteShoppingListUseCase()

    await deleteShoppingListUseCase.execute({
      userId,
      listId,
    })

    return reply.status(204).send()
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message, code: err.code })
    }
    if (err instanceof UnauthorizedError) {
      return reply.status(403).send({ message: err.message, code: err.code })
    }

    throw err
  }
}
