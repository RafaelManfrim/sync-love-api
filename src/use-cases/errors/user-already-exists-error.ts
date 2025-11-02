import { AppError } from './app-error'

export class UserAlreadyExistsError extends AppError {
  constructor() {
    super('Esse e-mail já está em uso.', 'USER_ALREADY_EXISTS')
  }
}
