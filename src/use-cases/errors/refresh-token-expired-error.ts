export class RefreshTokenExpiredError extends Error {
  constructor() {
    super('O token de refresh expirou.')
  }
}
