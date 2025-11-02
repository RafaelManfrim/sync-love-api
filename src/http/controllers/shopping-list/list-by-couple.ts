import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { makeListCoupleShoppingListsUseCase } from '@/use-cases/factories/make-list-couple-shopping-lists-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function listByCouple(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const listCoupleShoppingListsUseCase = makeListCoupleShoppingListsUseCase()

  try {
    const { shoppingLists } = await listCoupleShoppingListsUseCase.execute({
      coupleId: request.user.coupleId,
    })

    return reply.status(200).send({
      shoppingLists,
    })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message, code: err.code })
    }
    throw err
  }
}
