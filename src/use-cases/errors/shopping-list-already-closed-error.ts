import { AppError } from './app-error'

export class ShoppingListAlreadyClosedError extends AppError {
  constructor() {
    super('A lista de compras já está fechada.', 'SHOPPING_LIST_ALREADY_CLOSED')
  }
}
