import { InvitationAlreadyAcceptedError } from '@/use-cases/errors/invitation-already-accepted-error'
import { InvitationAlreadyRejectedError } from '@/use-cases/errors/invitation-already-rejected-error'
import { InvitationNotFoundError } from '@/use-cases/errors/invitation-not-found-error'
import { UserNotFoundError } from '@/use-cases/errors/user-not-found-error'
import { makeDeclineInvitationUseCase } from '@/use-cases/factories/make-decline-invitation-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function decline(request: FastifyRequest, reply: FastifyReply) {
  const declineInvitationParamsSchema = z.object({
    id: z.coerce.number(),
  })

  const { id } = declineInvitationParamsSchema.parse(request.params)

  const declineInvitationUseCase = makeDeclineInvitationUseCase()

  try {
    await declineInvitationUseCase.execute({
      id,
      userId: request.user.sub,
    })
  } catch (err) {
    if (err instanceof InvitationNotFoundError) {
      return reply.status(404).send({ message: err.message, code: err.code })
    }

    if (err instanceof UserNotFoundError) {
      return reply.status(404).send({ message: err.message, code: err.code })
    }

    if (err instanceof InvitationAlreadyRejectedError) {
      return reply.status(400).send({ message: err.message, code: err.code })
    }

    if (err instanceof InvitationAlreadyAcceptedError) {
      return reply.status(400).send({ message: err.message, code: err.code })
    }

    throw err
  }

  return reply.send()
}
