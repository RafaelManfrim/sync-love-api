import { AppError } from './app-error'

export class InvitationAlreadyAcceptedError extends AppError {
  constructor() {
    super(
      'O convite dessa pessoa já foi aceito.',
      'INVITATION_ALREADY_ACCEPTED',
    )
  }
}
