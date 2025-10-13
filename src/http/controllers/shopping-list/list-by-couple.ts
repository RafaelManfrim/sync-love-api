import { makeListCoupleShoppingListsUseCase } from '@/use-cases/factories/make-list-couple-shopping-lists-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function listByCouple(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const listCoupleShoppingListsUseCase = makeListCoupleShoppingListsUseCase()

  const { shoppingLists } = await listCoupleShoppingListsUseCase.execute({
    coupleId: request.user.coupleId,
  })

  return reply.status(200).send({
    shoppingLists,
  })
}
