import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { ResourceNotFoundError } from '@use-cases/errors/resource-not-found-error'
import { UnauthorizedError } from '@use-cases/errors/unauthorized-error'
import { makeCreateHouseholdTaskExceptionUseCase } from '@use-cases/factories/make-create-household-task-exception-use-case'
import { TaskExceptionAlreadyExistsError } from '@use-cases/errors/task-exception-already-exists-error'

export async function createException(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createExceptionParamsSchema = z.object({
    taskId: z.coerce.number().int(),
  })

  const createExceptionBodySchema = z.object({
    exceptionDate: z.coerce.date(), // Data "YYYY-MM-DD"
  })

  const { taskId } = createExceptionParamsSchema.parse(request.params)
  const { exceptionDate } = createExceptionBodySchema.parse(request.body)
  const userId = request.user.sub

  try {
    const createHouseholdTaskExceptionUseCase =
      makeCreateHouseholdTaskExceptionUseCase()

    await createHouseholdTaskExceptionUseCase.execute({
      taskId,
      userId,
      exceptionDate,
    })

    return reply.status(201).send() // 201 Created
  } catch (error) {
    if (error instanceof TaskExceptionAlreadyExistsError) {
      return reply
        .status(409)
        .send({ message: error.message, code: error.code }) // 409 Conflict
    }

    if (error instanceof ResourceNotFoundError) {
      return reply
        .status(404)
        .send({ message: error.message, code: error.code }) // 404 Not Found
    }

    if (error instanceof UnauthorizedError) {
      return reply
        .status(403)
        .send({ message: error.message, code: error.code }) // 403 Forbidden
    }

    throw error
  }
}
