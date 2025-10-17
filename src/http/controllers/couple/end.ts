import { makeEndRelationshipUseCase } from '@/use-cases/factories/make-end-relationship-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function end(request: FastifyRequest, reply: FastifyReply) {
  const endRelationshipUseCase = makeEndRelationshipUseCase()

  await endRelationshipUseCase.execute({
    coupleId: request.user.coupleId,
  })

  return reply.status(204).send()
}
