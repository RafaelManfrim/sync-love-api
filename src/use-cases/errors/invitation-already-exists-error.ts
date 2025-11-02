import { AppError } from './app-error'

export class InvitationAlreadyExistsError extends AppError {
  constructor() {
    super(
      'O convite para essa pessoa já foi enviado.',
      'INVITATION_ALREADY_EXISTS',
    )
  }
}
