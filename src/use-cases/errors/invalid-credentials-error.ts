import { AppError } from './app-error'

export class InvalidCredentialsError extends AppError {
  constructor() {
    super('As credenciais fornecidas são inválidas.', 'INVALID_CREDENTIALS')
  }
}
