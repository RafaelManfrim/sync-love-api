export class InvalidCredentialsError extends Error {
  constructor() {
    super('As credenciais fornecidas são inválidas.')
  }
}
