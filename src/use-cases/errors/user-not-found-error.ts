export class UserNotFoundError extends Error {
  constructor() {
    super('O usuário não foi encontrado.')
  }
}
