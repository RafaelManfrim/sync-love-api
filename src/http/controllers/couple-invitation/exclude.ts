import { InvitationNotFoundError } from '@/use-cases/errors/invitation-not-found-error'
import { makeExcludeInvitationUseCase } from '@/use-cases/factories/make-exclude-invitation-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function exclude(request: FastifyRequest, reply: FastifyReply) {
  const excludeInvitationParamsSchema = z.object({
    id: z.coerce.number(),
  })

  const { id } = excludeInvitationParamsSchema.parse(request.params)

  const excludeInvitationUseCase = makeExcludeInvitationUseCase()

  try {
    await excludeInvitationUseCase.execute({
      id,
      userId: request.user.sub,
    })
  } catch (err) {
    if (err instanceof InvitationNotFoundError) {
      return reply.status(404).send({ message: err.message, code: err.code })
    }

    throw err
  }

  return reply.status(204).send()
}
