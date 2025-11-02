import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { makeGetCoupleDetailsUseCase } from '@/use-cases/factories/make-get-couple-details-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function details(request: FastifyRequest, reply: FastifyReply) {
  const getCoupleDetailsUseCase = makeGetCoupleDetailsUseCase()

  try {
    const { ...coupleDetails } = await getCoupleDetailsUseCase.execute({
      userId: request.user.sub,
    })

    return reply.send({ coupleDetails })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message, code: err.code })
    }

    throw err
  }
}
