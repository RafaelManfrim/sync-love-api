import { AppError } from './app-error'

export class RefreshTokenNotFoundError extends AppError {
  constructor() {
    super('O token de refresh não foi encontrado.', 'REFRESH_TOKEN_NOT_FOUND')
  }
}
