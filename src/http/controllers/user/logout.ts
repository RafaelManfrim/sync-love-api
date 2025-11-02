import { FastifyReply, FastifyRequest } from 'fastify'
import { makeLogoutUseCase } from '@/use-cases/factories/make-logout-use-case'
import { UserNotFoundError } from '@/use-cases/errors/user-not-found-error'

export async function logout(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.sub

  const logoutUseCase = makeLogoutUseCase()

  try {
    await logoutUseCase.execute({ userId })
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return reply.status(404).send({ message: err.message, code: err.code })
    }
  }

  return reply.status(204).send()
}
