import { HouseholdTasksRepository } from '@repositories/household-tasks-repository'
import { UsersRepository } from '@repositories/users-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { HouseholdTaskCompletionsRepository } from '@repositories/household-task-completions-repository'
import { RRule } from 'rrule'

// --- Tipos de Resposta ---
type MemberSummary = {
  id: number
  name: string
  avatar_url: string | null
  completedCount: number
}

export type HouseholdTaskSummary = {
  totalPlanned: number
  totalCompleted: number
  members: MemberSummary[]
}
// --- Fim dos Tipos ---

interface GetHouseholdTasksSummaryUseCaseRequest {
  userId: number
  year: number
  month: number // 1 (Jan) a 12 (Dez)
}

interface GetHouseholdTasksSummaryUseCaseResponse {
  summary: HouseholdTaskSummary
}

export class GetHouseholdTasksSummaryUseCase {
  constructor(
    private householdTasksRepository: HouseholdTasksRepository,
    private householdTaskCompletionsRepository: HouseholdTaskCompletionsRepository,
    private usersRepository: UsersRepository,
  ) {}

  /**
   * Retorna o início (UTC 00:00) e o fim (UTC 23:59) do mês.
   */
  private getMonthDateRange(year: number, month: number) {
    // Início do mês (ex: 2025-10-01 00:00:00 UTC)
    const monthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0))

    // Fim do mês (ex: 2025-10-31 23:59:59 UTC)
    // (Ir para o próximo mês e subtrair 1 milissegundo)
    const nextMonth = new Date(Date.UTC(year, month, 1))
    const monthEnd = new Date(nextMonth.getTime() - 1)

    return [monthStart, monthEnd]
  }

  /**
   * Calcula o total de tarefas planejadas para o mês.
   */
  private async calculateTotalPlanned(
    coupleId: number,
    monthStart: Date,
    monthEnd: Date,
  ): Promise<number> {
    const allTasks =
      await this.householdTasksRepository.findAllByCoupleIdIncludingDeleted(
        coupleId,
      )

    let totalPlanned = 0

    for (const task of allTasks) {
      // Trata a data de início da tarefa como UTC
      const taskStartDate = new Date(
        Date.UTC(
          task.start_date.getUTCFullYear(),
          task.start_date.getUTCMonth(),
          task.start_date.getUTCDate(),
          task.start_date.getUTCHours(),
          task.start_date.getUTCMinutes(),
        ),
      )

      if (task.deleted_at && task.deleted_at < monthStart) {
        continue
      }

      // Se a tarefa só começa depois do fim do mês, pule
      if (taskStartDate > monthEnd) {
        continue
      }

      let ruleEndDate = monthEnd
      if (task.deleted_at && task.deleted_at < monthEnd) {
        ruleEndDate = task.deleted_at
      }

      if (task.recurrence_rule) {
        // Tarefa Recorrente
        const rule = RRule.fromString(
          `DTSTART:${taskStartDate.toISOString().replace(/\.\d{3}Z$/, 'Z')}\n${
            task.recurrence_rule
          }`,
        )

        const occurrences = rule.between(monthStart, ruleEndDate)
        totalPlanned += occurrences.length
      } else {
        // Tarefa Única
        // Se a data de vencimento (start_date) cair dentro do mês
        if (taskStartDate >= monthStart && taskStartDate <= ruleEndDate) {
          totalPlanned += 1
        }
      }
    }
    return totalPlanned
  }

  async execute({
    userId,
    year,
    month,
  }: GetHouseholdTasksSummaryUseCaseRequest): Promise<GetHouseholdTasksSummaryUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user || !user.couple_id) {
      throw new ResourceNotFoundError()
    }

    const coupleId = user.couple_id
    const [monthStart, monthEnd] = this.getMonthDateRange(year, month)

    // 1. Calcular o total de tarefas PREVISTAS (Lógica RRule)
    const totalPlanned = await this.calculateTotalPlanned(
      coupleId,
      monthStart,
      monthEnd,
    )

    // 2. Buscar o sumário de tarefas CONCLUÍDAS (Query DB)
    const completedSummary =
      await this.householdTaskCompletionsRepository.getSummaryByMonth(
        coupleId,
        monthStart,
        monthEnd,
      )

    // 3. Buscar os membros do casal
    const coupleMembers =
      await this.usersRepository.findManyByCoupleId(coupleId)

    let totalCompleted = 0

    // 4. Mapear o resultado
    const membersSummary: MemberSummary[] = coupleMembers.map((member) => {
      const completionData = completedSummary.find(
        (s) => s.completed_by_user_id === member.id,
      )

      const completedCount = completionData?._count || 0
      totalCompleted += completedCount // Soma para o total geral

      return {
        id: member.id,
        name: member.name,
        avatar_url: member.avatar_url,
        completedCount,
      }
    })

    return {
      summary: {
        totalPlanned,
        totalCompleted,
        members: membersSummary,
      },
    }
  }
}
