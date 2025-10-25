export class TaskExceptionAlreadyExistsError extends Error {
  constructor() {
    super('Essa exceção de tarefa já existe para o dia informado.')
  }
}
