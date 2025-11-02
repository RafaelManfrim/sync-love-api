import { AppError } from './app-error'

export class ResourceNotFoundError extends AppError {
  constructor() {
    super('O recurso solicitado não foi encontrado.', 'RESOURCE_NOT_FOUND')
  }
}
