import { FastifyRequest, FastifyReply } from 'fastify'
import { makeFetchHouseholdTasksUseCase } from '@/use-cases/factories/make-fetch-household-tasks-use-case'

/**
 * GET /tasks
 * Retorna todas as tarefas ativas do casal.
 */
export async function fetchAll(request: FastifyRequest, reply: FastifyReply) {
  const coupleId = request.user.coupleId

  const fetchHouseholdTasksUseCase = makeFetchHouseholdTasksUseCase()

  const { tasks } = await fetchHouseholdTasksUseCase.execute({
    coupleId,
  })

  return reply.send({
    tasks,
  })
}
