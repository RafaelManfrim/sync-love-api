import { FastifyInstance } from 'fastify'

import { logout } from '../controllers/user/logout'
import { userData } from '../controllers/user/user-data'
import { verifyJWT } from '../middlewares/verify-jwt'
import { updatePassword } from '../controllers/user/update-password'
import { updateName } from '../controllers/user/update-name'
import { updateAvatar } from '../controllers/user/update-avatar'
import { deleteAccount } from '../controllers/user/delete-account'

export async function usersRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/users/data', userData)
  app.post('/users/logout', logout)
  app.patch('/users', updateName)
  app.patch('/users/password', updatePassword)
  app.patch('/users/avatar', updateAvatar)
  app.delete('/users/me', deleteAccount)
}
