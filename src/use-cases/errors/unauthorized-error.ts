import { AppError } from './app-error'

export class UnauthorizedError extends AppError {
  constructor() {
    super('Solicitação não autorizada.', 'UNAUTHORIZED')
  }
}
