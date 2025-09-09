import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '@lib/prisma'

import { generateTokensJWT } from '@utils/generate-tokens-jwt'

export async function authenticateUser(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  })

  const { email, password } = bodySchema.parse(request.body)

  const user = await prisma.user.findUnique({
    where: {
      email,
      password_hash: password,
    },
  })

  if (!user) {
    return reply.status(401).send({
      message: 'Credenciais inválidas',
    })
  }

  const { access, refresh } = await generateTokensJWT(user, reply)

  await prisma.userRefreshToken.deleteMany({
    where: {
      user_id: user.id,
    },
  })

  await prisma.userRefreshToken.create({
    data: {
      user_id: user.id,
      token: refresh,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  })

  return reply.status(200).send({
    access_token: access,
    refresh_token: refresh,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  })
}
