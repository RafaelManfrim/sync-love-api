export class ShoppingListAlreadyClosedError extends Error {
  constructor() {
    super('A lista de compras já está fechada.')
  }
}
