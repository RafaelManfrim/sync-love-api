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

  await toggleShoppingItemCheckUseCase.execute({
    listId,
    shoppingItemId: itemId,
    coupleId: request.user.coupleId,
  })

  return reply.status(204).send()
}
