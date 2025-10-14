import { makeAddItemToShoppingListUseCase } from '@/use-cases/factories/make-add-item-to-shopping-list-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function addItem(request: FastifyRequest, reply: FastifyReply) {
  const addItemParamsSchema = z.object({
    listId: z.coerce.number(),
  })

  const addItemBodySchema = z.object({
    itemName: z.string(),
    quantity: z.number().min(1),
  })

  const { listId } = addItemParamsSchema.parse(request.params)
  const { itemName, quantity } = addItemBodySchema.parse(request.body)

  const addItemToShoppingListUseCase = makeAddItemToShoppingListUseCase()

  await addItemToShoppingListUseCase.execute({
    shoppingListId: listId,
    itemName,
    // quantity,
    userId: request.user.sub,
    coupleId: request.user.coupleId,
  })

  return reply.status(201).send()
}
