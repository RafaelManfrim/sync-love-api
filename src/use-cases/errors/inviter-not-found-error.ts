import { AppError } from './app-error'

export class InviterNotFoundError extends AppError {
  constructor() {
    super(
      'O usuário que está enviando o convite não foi encontrado.',
      'INVITER_NOT_FOUND',
    )
  }
}
