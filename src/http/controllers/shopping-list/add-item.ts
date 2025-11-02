import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { ShoppingListAlreadyClosedError } from '@/use-cases/errors/shopping-list-already-closed-error'
import { UnauthorizedError } from '@/use-cases/errors/unauthorized-error'
import { makeAddItemToShoppingListUseCase } from '@/use-cases/factories/make-add-item-to-shopping-list-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function addItem(request: FastifyRequest, reply: FastifyReply) {
  const addItemParamsSchema = z.object({
    listId: z.coerce.number(),
  })

  const addItemBodySchema = z.object({
    itemName: z.string(),
    quantity: z.number().optional().default(1),
  })

  const { listId } = addItemParamsSchema.parse(request.params)
  const { itemName, quantity } = addItemBodySchema.parse(request.body)

  const addItemToShoppingListUseCase = makeAddItemToShoppingListUseCase()

  try {
    await addItemToShoppingListUseCase.execute({
      shoppingListId: listId,
      itemName,
      quantity,
      userId: request.user.sub,
      coupleId: request.user.coupleId,
    })

    return reply.status(201).send()
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message, code: err.code })
    }

    if (err instanceof UnauthorizedError) {
      return reply.status(403).send({ message: err.message, code: err.code })
    }

    if (err instanceof ShoppingListAlreadyClosedError) {
      return reply.status(400).send({ message: err.message, code: err.code })
    }

    throw err
  }
}
