import { AppError } from './app-error'

export class UserNotFoundError extends AppError {
  constructor() {
    super('O usuário não foi encontrado.', 'USER_NOT_FOUND')
  }
}
