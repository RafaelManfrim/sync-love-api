import { FastifyInstance } from 'fastify'

import { verifyJWT } from '../middlewares/verify-jwt'
import { details } from '../controllers/couple/details'
import { end } from '../controllers/couple/end'

export async function couplesRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/couples/details', details)
  app.delete('/couples/end', end)
}
