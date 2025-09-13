export class InvitationAlreadyExistsError extends Error {
  constructor() {
    super('O convite para essa pessoa já foi enviado.')
  }
}
