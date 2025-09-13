import { FastifyInstance } from 'fastify'

import { verifyJWT } from '../middlewares/verify-jwt'
import { list } from '../controllers/couple-invitation/list'
import { invite } from '../controllers/couple-invitation/invite'
import { accept } from '../controllers/couple-invitation/accept'
import { decline } from '../controllers/couple-invitation/decline'
import { exclude } from '../controllers/couple-invitation/exclude'

export async function coupleInvitationsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/couple-invitations', list)
  app.post('/couple-invitations/invite', invite)
  app.post('/couple-invitations/:id/accept', accept)
  app.post('/couple-invitations/:id/decline', decline)
  app.delete('/couple-invitations/:id', exclude)
}
