import { FastifyInstance } from 'fastify'

import { verifyJWT } from '../middlewares/verify-jwt'
import { listByCouple } from '../controllers/shopping-list/list-by-couple'
import { create } from '../controllers/shopping-list/create'
import { addItem } from '../controllers/shopping-list/add-item'
import { toggleItemCheck } from '../controllers/shopping-list/toggle-item-check'
import { close } from '../controllers/shopping-list/close'
import { getById } from '../controllers/shopping-list/get-by-id'
import { listProducts } from '../controllers/shopping-list/list-products'

export async function shoppingListsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/shopping-lists', listByCouple)
  app.post('/shopping-lists', create)

  app.get('/shopping-lists/products', listProducts)

  app.get('/shopping-lists/:listId', getById)

  app.post('/shopping-lists/:listId/items', addItem)
  app.patch('/shopping-lists/:listId/items/:itemId/toggle', toggleItemCheck)
  app.post('/shopping-lists/:listId/close', close)
}
