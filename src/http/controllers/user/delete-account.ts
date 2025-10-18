import { makeDeleteAccountUseCase } from '@/use-cases/factories/make-delete-account-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function deleteAccount(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const deleteAccountUseCase = makeDeleteAccountUseCase()

  await deleteAccountUseCase.execute({
    userId: request.user.sub,
  })

  return reply.status(204).send()
}
