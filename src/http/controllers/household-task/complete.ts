import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCompleteHouseholdTaskUseCase } from '@use-cases/factories/make-complete-household-task-use-case'
import { TaskAlreadyCompletedError } from '@use-cases/errors/task-already-completed-error'
import { ResourceNotFoundError } from '@use-cases/errors/resource-not-found-error'
import { UnauthorizedError } from '@use-cases/errors/unauthorized-error'

export async function complete(request: FastifyRequest, reply: FastifyReply) {
  const completeTaskParamsSchema = z.object({
    taskId: z.coerce.number().int(),
  })

  const completeTaskBodySchema = z.object({
    taskDueDate: z.coerce.date(), // Data no formato "YYYY-MM-DD"
  })

  const { taskId } = completeTaskParamsSchema.parse(request.params)
  const { taskDueDate } = completeTaskBodySchema.parse(request.body)
  const userId = request.user.sub

  try {
    const completeHouseholdTaskUseCase = makeCompleteHouseholdTaskUseCase()

    await completeHouseholdTaskUseCase.execute({
      taskId,
      userId,
      taskDueDate,
    })

    return reply.status(201).send() // 201 Created
  } catch (error) {
    if (error instanceof TaskAlreadyCompletedError) {
      return reply.status(409).send({ message: error.message }) // 409 Conflict
    }
    if (
      error instanceof ResourceNotFoundError ||
      error instanceof UnauthorizedError
    ) {
      return reply.status(403).send({ message: error.message }) // 403 Forbidden/Not Found
    }

    throw error
  }
}
