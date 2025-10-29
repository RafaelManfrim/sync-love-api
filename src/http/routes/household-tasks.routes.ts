import { FastifyInstance } from 'fastify'
import { verifyJWT } from '@http/middlewares/verify-jwt'
import { create } from '@http/controllers/household-task/create'
import { fetchAll } from '@http/controllers/household-task/fetch-all'
import { fetchByDay } from '../controllers/household-task/fetch-by-day'
import { summary } from '../controllers/household-task/summary'
import { complete } from '../controllers/household-task/complete'
import { update } from '../controllers/household-task/update'
import { remove } from '../controllers/household-task/remove'
import { createException } from '../controllers/household-task/create-exception'
import { deleteCompletion } from '../controllers/household-task/delete-completion'
import { getDetails } from '../controllers/household-task/get-details'
import { deleteException } from '../controllers/household-task/delete-exception'

export async function householdTasksRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post('/tasks', create)

  // GET /tasks - busca todas as tarefas do casal
  app.get('/tasks', fetchAll)

  app.get('/tasks/:taskId', getDetails)

  // GET /tasks/by-day?date=YYYY-MM-DD
  app.get('/tasks/by-day', fetchByDay)

  // GET /tasks/summary?year=YYYY&month=MM
  app.get('/tasks/summary', summary)

  app.post('/tasks/:taskId/complete', complete)

  app.put('/tasks/:taskId', update)

  app.delete('/tasks/:taskId', remove)

  app.post('/tasks/:taskId/exceptions', createException)

  app.delete('/tasks/exceptions/:exceptionId', deleteException)

  app.delete('/tasks/completions/:completionId', deleteCompletion)
}
