import { makeCloseShoppingListUseCase } from '@/use-cases/factories/make-close-shopping-list-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function close(request: FastifyRequest, reply: FastifyReply) {
  const closeShoppingListParamsSchema = z.object({
    listId: z.coerce.number(),
  })

  const closeShoppingListBodySchema = z.object({
    items: z.array(
      z.object({
        shoppingItemId: z.number(),
        unitPrice: z.number(),
      }),
    ),
  })

  const { listId } = closeShoppingListParamsSchema.parse(request.params)
  const { items } = closeShoppingListBodySchema.parse(request.body)

  const closeShoppingListUseCase = makeCloseShoppingListUseCase()

  await closeShoppingListUseCase.execute({
    shoppingListId: listId,
    items,
    userId: request.user.sub,
    coupleId: request.user.coupleId,
  })

  return reply.status(204).send()
}
