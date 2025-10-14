export class UnauthorizedError extends Error {
  constructor() {
    super('Solicitação não autorizada.')
  }
}
