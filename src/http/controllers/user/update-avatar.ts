import { makeUpdateAvatarUseCase } from '@/use-cases/factories/make-update-avatar-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function updateAvatar(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // O `request.file()` vem do plugin @fastify/multipart
  const file = await request.file()

  if (!file) {
    return reply.status(400).send({ message: 'Nenhum arquivo enviado.' })
  }

  const updateAvatarUseCase = makeUpdateAvatarUseCase()

  const { avatarUrl } = await updateAvatarUseCase.execute({
    userId: request.user.sub,
    file,
  })

  return reply.status(200).send({ avatarUrl })
}
