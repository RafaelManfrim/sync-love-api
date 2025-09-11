import { FastifyReply, FastifyRequest } from 'fastify'
import { makeLogoutUseCase } from '@/use-cases/factories/make-logout-use-case'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'

export async function logout(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.sub

  const logoutUseCase = makeLogoutUseCase()

  try {
    await logoutUseCase.execute({ userId })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }
  }

  return reply.status(204).send()
}
