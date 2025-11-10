import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeUpdateShoppingListUseCase } from '@use-cases/factories/make-update-shopping-list-use-case'
import { ResourceNotFoundError } from '@use-cases/errors/resource-not-found-error'
import { UnauthorizedError } from '@use-cases/errors/unauthorized-error'
import { ShoppingListAlreadyClosedError } from '@use-cases/errors/shopping-list-already-closed-error'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateParamsSchema = z.object({
    listId: z.coerce.number().int(),
  })

  const updateBodySchema = z.object({
    name: z.string().min(1, 'O nome da lista é obrigatório.'),
  })

  const { listId } = updateParamsSchema.parse(request.params)
  const { name } = updateBodySchema.parse(request.body)
  const userId = request.user.sub

  try {
    const updateShoppingListUseCase = makeUpdateShoppingListUseCase()

    const { shoppingList } = await updateShoppingListUseCase.execute({
      userId,
      listId,
      name,
    })

    return reply.status(200).send(shoppingList)
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message, code: err.code })
    }
    if (err instanceof UnauthorizedError) {
      return reply.status(403).send({ message: err.message, code: err.code })
    }
    if (err instanceof ShoppingListAlreadyClosedError) {
      return reply.status(409).send({ message: err.message, code: err.code })
    }
    throw err
  }
}
