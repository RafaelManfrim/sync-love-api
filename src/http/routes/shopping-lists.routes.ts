import { FastifyInstance } from 'fastify'

import { verifyJWT } from '../middlewares/verify-jwt'
import { listByCouple } from '../controllers/shopping-list/list-by-couple'

export async function shoppingListsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/shopping-lists', listByCouple)
}
