export class InvitationAlreadyAcceptedError extends Error {
  constructor() {
    super('O convite dessa pessoa já foi aceito.')
  }
}
