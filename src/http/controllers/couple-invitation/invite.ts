import { InviterNotFoundError } from '@/use-cases/errors/inviter-not-found-error'
import { makeCreateInvitationUseCase } from '@/use-cases/factories/make-create-invitation-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function invite(request: FastifyRequest, reply: FastifyReply) {
  const createCoupleInviteBodySchema = z.object({
    email: z.string().email().nonempty(),
  })

  const { email } = createCoupleInviteBodySchema.parse(request.body)

  const createInvitationUseCase = makeCreateInvitationUseCase()

  try {
    const { invite } = await createInvitationUseCase.execute({
      inviterId: request.user.sub,
      email,
    })

    return reply.send({ invite })
  } catch (err) {
    if (err instanceof InviterNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    throw err
  }
}
