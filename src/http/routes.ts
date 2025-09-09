import { FastifyInstance } from 'fastify'

import { createUser } from './controllers/user/create-user'
import { authenticateUser } from './controllers/user/authenticate-user'
import { logout } from './controllers/user/logout'
import { userData } from './controllers/user/user-data'
import { invitePartner } from './controllers/user/invite-partner'
import { verifyInvitations } from './controllers/user/verify-invitations'

export async function appRoutes(app: FastifyInstance) {
  app.post('/users', createUser)
  app.post('/users/login', authenticateUser)
  app.post('/users/logout', logout)

  app.get('/users/data', userData)
  app.post('/users/invite-partner', invitePartner)
  app.post('/users/verify-invitations', verifyInvitations)
}
