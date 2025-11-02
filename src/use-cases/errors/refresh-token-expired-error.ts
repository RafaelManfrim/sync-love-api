import { AppError } from './app-error'

export class RefreshTokenExpiredError extends AppError {
  constructor() {
    super('O token de refresh expirou.', 'REFRESH_TOKEN_EXPIRED')
  }
}
