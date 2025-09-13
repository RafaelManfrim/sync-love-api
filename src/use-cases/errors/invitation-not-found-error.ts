export class InvitationNotFoundError extends Error {
  constructor() {
    super('O convite não foi encontrado.')
  }
}
