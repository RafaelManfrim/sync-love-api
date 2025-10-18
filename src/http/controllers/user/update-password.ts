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

  await updatePasswordUseCase.execute({
    userId: request.user.sub,
    oldPassword,
    newPassword,
  })

  return reply.status(204).send()
}
