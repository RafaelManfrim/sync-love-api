import { AppError } from './app-error'

export class TaskAlreadyCompletedError extends AppError {
  constructor() {
    super(
      'A tarefa doméstica já foi concluída para este dia.',
      'TASK_ALREADY_COMPLETED',
    )
  }
}
