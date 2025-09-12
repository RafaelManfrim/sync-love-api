export class InviterNotFoundError extends Error {
  constructor() {
    super('O usuário que está enviando o convite não foi encontrado.')
  }
}
