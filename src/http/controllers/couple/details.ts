import { makeGetCoupleDetailsUseCase } from '@/use-cases/factories/make-get-couple-details-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function details(request: FastifyRequest, reply: FastifyReply) {
  const getCoupleDetailsUseCase = makeGetCoupleDetailsUseCase()

  const { ...coupleDetails } = await getCoupleDetailsUseCase.execute({
    userId: request.user.sub,
  })

  return reply.send({ coupleDetails })
}
