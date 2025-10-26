import { prisma } from '@lib/prisma'
import {
  CompletionCountByUser,
  HouseholdTaskCompletionsRepository,
  HouseholdTaskCompletionWithTask,
  HouseholdTaskCompletionWithUser,
  MonthlyCompletionSummary,
} from '../household-task-completions-repository'
import { HouseholdTaskCompletion, Prisma } from '@prisma/client'

export class PrismaHouseholdTaskCompletionsRepository
  implements HouseholdTaskCompletionsRepository
{
  async findManyByCoupleIdAndDate(
    coupleId: number,
    date: Date,
  ): Promise<HouseholdTaskCompletionWithUser[]> {
    // Busca conclusões para a data específica,
    // filtrando por tarefas que pertencem ao casal.
    const completions = await prisma.householdTaskCompletion.findMany({
      where: {
        task_due_date: date, // O schema usa @db.Date, então o Prisma trata a data corretamente
        household_task: {
          couple_id: coupleId,
        },
      },
      include: {
        completed_by: true, // Inclui os dados do usuário que completou
      },
    })
    return completions
  }

  async getSummaryByMonth(
    coupleId: number,
    monthStart: Date,
    monthEnd: Date,
  ): Promise<MonthlyCompletionSummary[]> {
    const summary = await prisma.householdTaskCompletion.groupBy({
      by: ['completed_by_user_id'],
      where: {
        // Filtra pelo intervalo do mês
        task_due_date: {
          gte: monthStart,
          lte: monthEnd,
        },
        // Filtra pelo casal
        household_task: {
          couple_id: coupleId,
        },
      },
      // Conta as ocorrências
      _count: true,
    })

    // O Prisma retorna _count: { _all: number } ou _count: number
    // Vamos normalizar para { completed_by_user_id: number, _count: number }
    return summary.map((item) => ({
      completed_by_user_id: item.completed_by_user_id,
      _count: typeof item._count === 'number' ? item._count : item._count,
    }))
  }

  async findByTaskIdAndDueDate(
    taskId: number,
    dueDate: Date,
  ): Promise<HouseholdTaskCompletion | null> {
    const completion = await prisma.householdTaskCompletion.findUnique({
      where: {
        household_task_id_task_due_date: {
          // Nome do índice @@unique
          household_task_id: taskId,
          task_due_date: dueDate,
        },
      },
    })
    return completion
  }

  async create(
    data: Prisma.HouseholdTaskCompletionUncheckedCreateInput,
  ): Promise<HouseholdTaskCompletion> {
    const completion = await prisma.householdTaskCompletion.create({
      data,
    })
    return completion
  }

  async deleteByTaskIdAndDueDate(taskId: number, dueDate: Date): Promise<void> {
    // Usamos 'deleteMany' pois o 'delete' unique não existe mais após o 'create'.
    // A constraint @@unique garante que isso só delete 0 ou 1 registro.
    await prisma.householdTaskCompletion.deleteMany({
      where: {
        household_task_id: taskId,
        task_due_date: dueDate,
      },
    })
  }

  async findById(id: number): Promise<HouseholdTaskCompletionWithTask | null> {
    const completion = await prisma.householdTaskCompletion.findUnique({
      where: {
        id,
      },
      include: {
        household_task: true, // Inclui a tarefa pai
      },
    })
    return completion
  }

  async deleteById(id: number): Promise<void> {
    await prisma.householdTaskCompletion.delete({
      where: {
        id,
      },
    })
  }

  async countByCoupleIdGroupedByUser(
    coupleId: number,
  ): Promise<CompletionCountByUser[]> {
    const summary = await prisma.householdTaskCompletion.groupBy({
      by: ['completed_by_user_id'],
      where: {
        // Filtra pelo casal
        household_task: {
          couple_id: coupleId,
          // Não precisamos filtrar por deleted_at aqui,
          // pois a conclusão permanece mesmo se a tarefa for deletada
        },
      },
      _count: true, // Conta as ocorrências
    })

    // Normaliza o retorno
    return summary.map((item) => ({
      completed_by_user_id: item.completed_by_user_id,
      _count: typeof item._count === 'number' ? item._count : item._count,
    }))
  }
}
