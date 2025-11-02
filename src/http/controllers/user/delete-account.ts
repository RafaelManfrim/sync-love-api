import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { makeDeleteAccountUseCase } from '@/use-cases/factories/make-delete-account-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function deleteAccount(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const deleteAccountUseCase = makeDeleteAccountUseCase()

  try {
    await deleteAccountUseCase.execute({
      userId: request.user.sub,
    })

    return reply.status(204).send()
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message, code: err.code })
    }

    throw err
  }
}
