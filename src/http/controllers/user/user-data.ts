import { UserNotFoundError } from '@/use-cases/errors/user-not-found-error'
import { makeUserDataUseCase } from '@/use-cases/factories/make-user-data-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function userData(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.sub

  const userDataUseCase = makeUserDataUseCase()

  try {
    const { user } = await userDataUseCase.execute({ userId })
    return reply.send({ user: { ...user, password_hash: undefined } })
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return reply.status(404).send({ message: err.message, code: err.code })
    }

    throw err
  }
}
