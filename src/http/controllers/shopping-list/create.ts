import { makeCreateShoppingListUseCase } from '@/use-cases/factories/make-create-shopping-list-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createShoppingListBodySchema = z.object({
    title: z.string(),
  })

  const { title } = createShoppingListBodySchema.parse(request.body)

  const createShoppingListUseCase = makeCreateShoppingListUseCase()

  await createShoppingListUseCase.execute({
    title,
    coupleId: request.user.coupleId,
    authorId: request.user.sub,
  })

  return reply.status(201).send()
}
