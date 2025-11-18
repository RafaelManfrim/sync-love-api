import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { makeEndRelationshipUseCase } from '@/use-cases/factories/make-end-relationship-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function end(request: FastifyRequest, reply: FastifyReply) {
  const endRelationshipUseCase = makeEndRelationshipUseCase()

  const coupleId = request.user.coupleId

  try {
    if (!coupleId) {
      throw new ResourceNotFoundError()
    }

    await endRelationshipUseCase.execute({
      coupleId: request.user.coupleId,
    })

    return reply.status(204).send()
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message, code: err.code })
    }

    throw err
  }
}
