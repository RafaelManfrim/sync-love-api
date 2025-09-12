import { FastifyInstance } from 'fastify'

import { logout } from '../controllers/user/logout'
import { userData } from '../controllers/user/user-data'
import { verifyJWT } from '../middlewares/verify-jwt'

export async function usersRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/users/data', userData)
  app.post('/users/logout', logout)
}
