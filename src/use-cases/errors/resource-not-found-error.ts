export class ResourceNotFoundError extends Error {
  constructor() {
    super('O recurso solicitado não foi encontrado.')
  }
}
