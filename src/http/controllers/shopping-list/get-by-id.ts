import { makeGetShoppingListUseCase } from '@/use-cases/factories/make-get-shopping-list'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function getById(request: FastifyRequest, reply: FastifyReply) {
  const toggleItemCheckParamsSchema = z.object({
    listId: z.coerce.number(),
  })

  const { listId } = toggleItemCheckParamsSchema.parse(request.params)

  const getShoppingListUseCase = makeGetShoppingListUseCase()

  const { shoppingList } = await getShoppingListUseCase.execute({
    listId,
    coupleId: request.user.coupleId,
  })

  return reply.send({ shoppingList })
}
