import { AppError } from './app-error'

export class InvitationAlreadyRejectedError extends AppError {
  constructor() {
    super(
      'O convite dessa pessoa já foi rejeitado.',
      'INVITATION_ALREADY_REJECTED',
    )
  }
}
