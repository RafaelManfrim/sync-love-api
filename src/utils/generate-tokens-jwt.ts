import { User } from '@prisma/client'
import { FastifyReply } from 'fastify'

export async function generateTokensJWT(user: User, reply: FastifyReply) {
  const access = await reply.jwtSign({
    sign: {
      sub: user.id,
    },
  })

  const refresh = await reply.jwtSign({
    sign: {
      sub: user.id,
      expiresIn: '7d',
    },
  })

  return {
    access,
    refresh,
  }
}
