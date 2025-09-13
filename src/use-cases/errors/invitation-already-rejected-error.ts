export class InvitationAlreadyRejectedError extends Error {
  constructor() {
    super('O convite dessa pessoa já foi rejeitado.')
  }
}
