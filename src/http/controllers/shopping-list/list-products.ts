import { makeListProductsUseCase } from '@/use-cases/factories/make-list-products-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function listProducts(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const listProductsUseCase = makeListProductsUseCase()

  const { products } = await listProductsUseCase.execute({
    coupleId: request.user.coupleId,
  })

  return reply.send({ products })
}
