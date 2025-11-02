import { AppError } from './app-error'

export class InvitationNotFoundError extends AppError {
  constructor() {
    super('O convite não foi encontrado.', 'INVITATION_NOT_FOUND')
  }
}
