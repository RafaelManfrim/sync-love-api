import { FastifyInstance } from 'fastify'

import { unauthenticatedRoutes } from './unauthenticated.routes'
import { usersRoutes } from './users.routes'
import { couplesRoutes } from './couples.routes'
import { coupleInvitationsRoutes } from './couple-invitations.routes'
import { shoppingListsRoutes } from './shopping-lists.routes'

export async function appRoutes(app: FastifyInstance) {
  app.register(unauthenticatedRoutes)
  app.register(usersRoutes)
  app.register(coupleInvitationsRoutes)
  app.register(couplesRoutes)
  app.register(shoppingListsRoutes)
}
