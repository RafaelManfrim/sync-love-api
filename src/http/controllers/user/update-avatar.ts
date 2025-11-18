import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { makeUpdateAvatarUseCase } from '@/use-cases/factories/make-update-avatar-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function updateAvatar(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // O `request.file()` vem do plugin @fastify/multipart
  const file = await request.file()

  if (!file) {
    return reply
      .status(400)
      .send({ message: 'Nenhum arquivo enviado.', code: 'NO_FILE_UPLOADED' })
  }

  const updateAvatarUseCase = makeUpdateAvatarUseCase()

  try {
    const { avatarUrl } = await updateAvatarUseCase.execute({
      userId: request.user.sub,
      file,
    })

    return reply.status(200).send({ avatarUrl })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message, code: err.code })
    }

    throw err
  }
}
