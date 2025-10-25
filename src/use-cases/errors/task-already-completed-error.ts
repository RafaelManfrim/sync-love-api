export class TaskAlreadyCompletedError extends Error {
  constructor() {
    super('A tarefa doméstica já foi concluída para este dia.')
  }
}
