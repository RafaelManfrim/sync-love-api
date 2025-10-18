import { makeUpdateNameUseCase } from '@/use-cases/factories/make-update-name-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function updateName(request: FastifyRequest, reply: FastifyReply) {
  const updateNameBodySchema = z.object({
    newName: z.string(),
  })

  const { newName } = updateNameBodySchema.parse(request.body)

  const updateNameUseCase = makeUpdateNameUseCase()

  await updateNameUseCase.execute({
    userId: request.user.sub,
    newName,
  })

  return reply.status(204).send()
}
