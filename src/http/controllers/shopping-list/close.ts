import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { ShoppingListAlreadyClosedError } from '@/use-cases/errors/shopping-list-already-closed-error'
import { UnauthorizedError } from '@/use-cases/errors/unauthorized-error'
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

  try {
    await closeShoppingListUseCase.execute({
      shoppingListId: listId,
      items,
      userId: request.user.sub,
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

    if (err instanceof ShoppingListAlreadyClosedError) {
      return reply.status(400).send({ message: err.message, code: err.code })
    }

    throw err
  }
}
