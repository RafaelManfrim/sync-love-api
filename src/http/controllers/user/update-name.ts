import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { makeUpdateNameUseCase } from '@/use-cases/factories/make-update-name-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function updateName(request: FastifyRequest, reply: FastifyReply) {
  const updateNameBodySchema = z.object({
    newName: z.string(),
  })

  const { newName } = updateNameBodySchema.parse(request.body)

  const updateNameUseCase = makeUpdateNameUseCase()

  try {
    await updateNameUseCase.execute({
      userId: request.user.sub,
      newName,
    })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message, code: err.code })
    }

    throw err
  }
}
