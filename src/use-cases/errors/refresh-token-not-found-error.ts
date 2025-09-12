export class RefreshTokenNotFoundError extends Error {
  constructor() {
    super('O token de refresh não foi encontrado.')
  }
}
