import { AppError } from './app-error'

export class TaskExceptionAlreadyExistsError extends AppError {
  constructor() {
    super(
      'Essa exceção de tarefa já existe para o dia informado.',
      'TASK_EXCEPTION_ALREADY_EXISTS',
    )
  }
}
