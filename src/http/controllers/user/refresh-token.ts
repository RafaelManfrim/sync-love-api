import { RefreshTokenExpiredError } from '@/use-cases/errors/refresh-token-expired-error'
import { RefreshTokenNotFoundError } from '@/use-cases/errors/refresh-token-not-found-error'
import { UserNotFoundError } from '@/use-cases/errors/user-not-found-error'
import { makeRefreshTokenUseCase } from '@/use-cases/factories/make-refresh-token-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function refreshToken(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const refreshAccessTokenBodySchema = z.object({
    refresh: z.string(),
  })

  const { refresh: oldRefresh } = refreshAccessTokenBodySchema.parse(
    request.body,
  )

  try {
    const refreshTokenUseCase = makeRefreshTokenUseCase()
    const { access, refresh } = await refreshTokenUseCase.execute({
      oldToken: oldRefresh,
      reply,
    })

    return reply.send({ access, refresh })
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return reply.status(404).send({ message: err.message, code: err.code })
    }

    if (err instanceof RefreshTokenNotFoundError) {
      return reply.status(404).send({ message: err.message, code: err.code })
    }

    if (err instanceof RefreshTokenExpiredError) {
      return reply.status(400).send({ message: err.message, code: err.code })
    }

    throw err
  }
}
