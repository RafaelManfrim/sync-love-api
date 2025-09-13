import { InvitationAlreadyAcceptedError } from '@/use-cases/errors/invitation-already-accepted-error'
import { InvitationAlreadyRejectedError } from '@/use-cases/errors/invitation-already-rejected-error'
import { InvitationNotFoundError } from '@/use-cases/errors/invitation-not-found-error'
import { UserNotFoundError } from '@/use-cases/errors/user-not-found-error'
import { makeAcceptInvitationUseCase } from '@/use-cases/factories/make-accept-invitation-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function accept(request: FastifyRequest, reply: FastifyReply) {
  const acceptInvitationParamsSchema = z.object({
    id: z.coerce.number(),
  })

  const { id } = acceptInvitationParamsSchema.parse(request.params)

  const acceptInvitationUseCase = makeAcceptInvitationUseCase()

  try {
    const { couple } = await acceptInvitationUseCase.execute({
      id,
      userId: request.user.sub,
    })

    return reply.status(201).send({ couple })
  } catch (err) {
    if (err instanceof InvitationNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    if (err instanceof UserNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    if (err instanceof InvitationAlreadyRejectedError) {
      return reply.status(400).send({ message: err.message })
    }

    if (err instanceof InvitationAlreadyAcceptedError) {
      return reply.status(400).send({ message: err.message })
    }

    throw err
  }
}
