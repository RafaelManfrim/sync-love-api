import { FastifyInstance } from 'fastify'

import { verifyJWT } from '../middlewares/verify-jwt'

export async function couplesRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)
}
