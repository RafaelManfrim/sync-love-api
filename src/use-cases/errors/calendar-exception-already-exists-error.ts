import { AppError } from './app-error'

export class CalendarExceptionAlreadyExistsError extends AppError {
  constructor() {
    super(
      'Essa ocorrência de evento já foi cancelada.',
      'CALENDAR_EXCEPTION_ALREADY_EXISTS',
    )
  }
}
