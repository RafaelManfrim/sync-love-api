import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaHouseholdTasksRepository } from '@/repositories/prisma/prisma-household-tasks-repository'

/**
 * GET /tasks
 * Retorna todas as tarefas ativas do casal.
 */
export async function fetchAll(request: FastifyRequest, reply: FastifyReply) {
  const coupleId = request.user.coupleId

  const tasksRepository = new PrismaHouseholdTasksRepository()
  const tasks = await tasksRepository.findManyByCoupleId(coupleId)

  return reply.status(200).send({ tasks })
}
