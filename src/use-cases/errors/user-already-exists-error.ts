export class UserAlreadyExistsError extends Error {
  constructor() {
    super('Esse e-mail já está em uso.')
  }
}
