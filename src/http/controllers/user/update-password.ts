import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { makeUpdatePasswordUseCase } from '@/use-cases/factories/make-update-password-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function updatePassword(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const updatePasswordBodySchema = z.object({
    oldPassword: z.string(),
    newPassword: z
      .string()
      .min(6, 'A nova senha deve ter no mínimo 6 caracteres.'),
  })

  const { oldPassword, newPassword } = updatePasswordBodySchema.parse(
    request.body,
  )

  const updatePasswordUseCase = makeUpdatePasswordUseCase()

  try {
    await updatePasswordUseCase.execute({
      userId: request.user.sub,
      oldPassword,
      newPassword,
    })

    return reply.status(204).send()
  } catch (err) {
    if (
      err instanceof ResourceNotFoundError ||
      err instanceof InvalidCredentialsError
    ) {
      return reply.status(400).send({ message: err.message, code: err.code })
    }

    throw err
  }
}
