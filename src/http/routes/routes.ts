import { FastifyInstance } from 'fastify'

import { unauthenticatedRoutes } from './unauthenticated.routes'
import { usersRoutes } from './users.routes'
import { couplesRoutes } from './couples.routes'
import { coupleInvitationsRoutes } from './couple-invitations.routes'
import { shoppingListsRoutes } from './shopping-lists.routes'
import { householdTasksRoutes } from './household-tasks.routes'
import { calendarEventsRoutes } from './calendar-events.routes'

export async function appRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    return { status: 'ok' }
  })

  app.register(unauthenticatedRoutes)
  app.register(usersRoutes)
  app.register(coupleInvitationsRoutes)
  app.register(couplesRoutes)
  app.register(shoppingListsRoutes)
  app.register(householdTasksRoutes)
  app.register(calendarEventsRoutes)
}
