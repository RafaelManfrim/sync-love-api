import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { UnauthorizedError } from '@/use-cases/errors/unauthorized-error'
import { makeGetShoppingListUseCase } from '@/use-cases/factories/make-get-shopping-list'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function getById(request: FastifyRequest, reply: FastifyReply) {
  const toggleItemCheckParamsSchema = z.object({
    listId: z.coerce.number(),
  })

  const { listId } = toggleItemCheckParamsSchema.parse(request.params)

  const getShoppingListUseCase = makeGetShoppingListUseCase()

  try {
    const { shoppingList } = await getShoppingListUseCase.execute({
      listId,
      coupleId: request.user.coupleId,
    })

    return reply.send({ shoppingList })
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
