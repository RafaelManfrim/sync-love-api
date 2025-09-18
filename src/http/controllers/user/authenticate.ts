import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { generateTokensJWT } from '@utils/generate-tokens-jwt'
import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'
import { makeAuthenticateUseCase } from '@/use-cases/factories/make-authenticate-use-case'
import { makeDeleteOldRefreshTokenUseCase } from '@/use-cases/factories/make-delete-old-refresh-token-use-case'
import { makeCreateRefreshTokenUseCase } from '@/use-cases/factories/make-create-refresh-token-use-case'

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  })

  const { email, password } = bodySchema.parse(request.body)

  try {
    const authenticateUseCase = makeAuthenticateUseCase()

    const { user } = await authenticateUseCase.execute({ email, password })

    const { access, refresh } = await generateTokensJWT(user, reply)

    const deleteOldRefreshTokenUseCase = makeDeleteOldRefreshTokenUseCase()
    await deleteOldRefreshTokenUseCase.execute({ userId: user.id })

    const createRefreshTokenUseCase = makeCreateRefreshTokenUseCase()
    await createRefreshTokenUseCase.execute({ userId: user.id, token: refresh })

    return reply.status(200).send({
      access_token: access,
      refresh_token: refresh,
      user: {
        ...user,
        password_hash: undefined,
      },
    })
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return reply.status(400).send({
        message: err.message,
      })
    }

    throw err
  }
}
