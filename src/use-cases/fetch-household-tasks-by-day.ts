import { HouseholdTasksRepository } from '@repositories/household-tasks-repository'
import { UsersRepository } from '@repositories/users-repository'
import { HouseholdTask, HouseholdTaskException } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import {
  HouseholdTaskCompletionsRepository,
  HouseholdTaskCompletionWithUser,
} from '@repositories/household-task-completions-repository'
import { RRule } from 'rrule'
import { HouseholdTaskExceptionsRepository } from '@/repositories/household-task-exceptions-repository'
import { formatDateForRRule } from '@/utils/date-utils'

// Define o formato da resposta: a Tarefa + a Conclusão (se houver)
export type TaskForDay = HouseholdTask & {
  completion: HouseholdTaskCompletionWithUser | null
  exception: HouseholdTaskException | null
}

interface FetchHouseholdTasksByDayUseCaseRequest {
  userId: number
  date: Date // A data (ex: 2025-10-25) que o usuário quer ver
}

interface FetchHouseholdTasksByDayUseCaseResponse {
  tasks: TaskForDay[]
}

export class FetchHouseholdTasksByDayUseCase {
  constructor(
    private householdTasksRepository: HouseholdTasksRepository,
    private householdTaskCompletionsRepository: HouseholdTaskCompletionsRepository,
    private householdTaskExceptionsRepository: HouseholdTaskExceptionsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    userId,
    date,
  }: FetchHouseholdTasksByDayUseCaseRequest): Promise<FetchHouseholdTasksByDayUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user || !user.couple_id) {
      throw new ResourceNotFoundError()
    }

    // 1. Buscar *todas* as definições de tarefas do casal
    const allTasksForCouple =
      await this.householdTasksRepository.findManyByCoupleId(user.couple_id)

    // 2. Buscar as conclusões *apenas* para o dia solicitado
    const completionsForDay =
      await this.householdTaskCompletionsRepository.findManyByCoupleIdAndDate(
        user.couple_id,
        date,
      )

    const exceptionsForDay =
      await this.householdTaskExceptionsRepository.findManyByCoupleIdAndDate(
        user.couple_id,
        date,
      )

    const tasksForDay: TaskForDay[] = []

    // 3. Definir o início e o fim do dia da consulta (em UTC)
    const queryDateStart = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        0,
        0,
        0,
      ),
    )
    const queryDateEnd = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        23,
        59,
        59,
      ),
    )

    // 4. Iterar e filtrar as tarefas na aplicação
    for (const task of allTasksForCouple) {
      let isDue = false

      // Trata a data de início da tarefa como UTC (apenas dia, sem horas)
      const taskStartDate = new Date(
        Date.UTC(
          task.start_date.getUTCFullYear(),
          task.start_date.getUTCMonth(),
          task.start_date.getUTCDate(),
          0, // Zera as horas para comparação correta
          0, // Zera os minutos
        ),
      )

      // Se a tarefa só começa no futuro, pule
      if (taskStartDate > queryDateEnd) {
        continue
      }

      if (task.recurrence_rule) {
        // Tarefa Recorrente
        const rule = RRule.fromString(
          `DTSTART:${formatDateForRRule(taskStartDate)}\n${
            task.recurrence_rule
          }`,
        )

        // Verifica se a regra gera uma ocorrência dentro do dia consultado
        const occurrences = rule.between(queryDateStart, queryDateEnd, true) // true = inclusive
        isDue = occurrences.length > 0
      } else {
        // Tarefa Única (recurrence_rule é null)
        // Verifica se a data de início (vencimento) é o dia consultado
        const taskDueDate = new Date(
          Date.UTC(
            taskStartDate.getUTCFullYear(),
            taskStartDate.getUTCMonth(),
            taskStartDate.getUTCDate(),
          ),
        )
        isDue = taskDueDate.getTime() === queryDateStart.getTime()
      }

      // 5. Se a tarefa é devida, adicione à lista e anexe a conclusão
      if (isDue) {
        const exception =
          exceptionsForDay.find((e) => e.household_task_id === task.id) || null

        const completion = !exception
          ? completionsForDay.find((c) => c.household_task_id === task.id) ||
            null
          : null

        tasksForDay.push({
          ...task,
          completion,
          exception,
        })
      }
    }

    return {
      tasks: tasksForDay,
    }
  }
}
