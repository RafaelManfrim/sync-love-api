import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { UnauthorizedError } from '@/use-cases/errors/unauthorized-error'
import { makeToggleShoppingItemCheckUseCase } from '@/use-cases/factories/make-toggle-shopping-item-check-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function toggleItemCheck(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const toggleItemCheckParamsSchema = z.object({
    listId: z.coerce.number(),
    itemId: z.coerce.number(),
  })

  const { itemId, listId } = toggleItemCheckParamsSchema.parse(request.params)

  const toggleShoppingItemCheckUseCase = makeToggleShoppingItemCheckUseCase()

  try {
    await toggleShoppingItemCheckUseCase.execute({
      listId,
      shoppingItemId: itemId,
      coupleId: request.user.coupleId,
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
