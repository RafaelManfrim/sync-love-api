import { FastifyInstance } from 'fastify'
import { verifyJWT } from '@http/middlewares/verify-jwt'
import { create } from '@http/controllers/calendar-event/create'
import { fetch } from '../controllers/calendar-event/fetch'
import { update } from '../controllers/calendar-event/update'
import { remove } from '../controllers/calendar-event/remove'
import { createException } from '../controllers/calendar-event/create-exception'
import { deleteException } from '../controllers/calendar-event/delete-exception'

export async function calendarEventsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post('/calendar-events', create)
  app.get('/calendar-events', fetch)
  app.put('/calendar-events/:eventId', update)
  app.delete('/calendar-events/:eventId', remove)

  app.post('/calendar-events/:eventId/exceptions', createException)
  app.delete('/calendar-events/exceptions/:exceptionId', deleteException)
}
