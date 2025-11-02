import { UserNotFoundError } from '@/use-cases/errors/user-not-found-error'
import { makeListInvitationsUseCase } from '@/use-cases/factories/make-list-invitations-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function list(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.sub

  const listInvitationsUseCase = makeListInvitationsUseCase()

  try {
    const { recievedInvites, sentInvites } =
      await listInvitationsUseCase.execute({ userId })

    return reply.send({ recievedInvites, sentInvites })
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return reply.status(404).send({ message: err.message, code: err.code })
    }

    throw err
  }
}
