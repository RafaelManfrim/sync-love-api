import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '@lib/prisma'

export async function logout(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.sub

  if (!userId) {
    return reply.status(401).send({
      message: 'Usuário não autenticado',
    })
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })

  if (!user) {
    return reply.status(404).send({
      message: 'Usuário não encontrado',
    })
  }

  await prisma.userRefreshToken.deleteMany({
    where: {
      user_id: userId,
    },
  })

  return reply.status(204).send()
}
