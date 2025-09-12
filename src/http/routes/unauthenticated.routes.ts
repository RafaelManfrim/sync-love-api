import { FastifyInstance } from 'fastify'

import { create } from '../controllers/user/create'
import { authenticate } from '../controllers/user/authenticate'
import { refreshToken } from '../controllers/user/refresh-token'

export async function unauthenticatedRoutes(app: FastifyInstance) {
  app.post('/users', create)
  app.post('/users/login', authenticate)
  app.post('/users/refresh-token', refreshToken)
}
