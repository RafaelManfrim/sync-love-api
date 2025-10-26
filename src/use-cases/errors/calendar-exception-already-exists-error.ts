export class CalendarExceptionAlreadyExistsError extends Error {
  constructor() {
    super('Essa ocorrência de evento já foi cancelada.')
  }
}
