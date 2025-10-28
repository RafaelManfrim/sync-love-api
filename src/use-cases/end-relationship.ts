import { prisma } from '@/lib/prisma'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { PrismaClient } from '@prisma/client'

interface EndRelationshipUseCaseRequest {
  coupleId: number
}

export class EndRelationshipUseCase {
  async execute(
    { coupleId }: EndRelationshipUseCaseRequest,
    tx?: PrismaClient,
  ) {
    const prismaClient = tx || prisma

    const couple = await prismaClient.couple.findUnique({
      where: { id: coupleId },
    })

    if (!couple) {
      throw new ResourceNotFoundError()
    }

    const transactionLogic = async (prismaTx: PrismaClient) => {
      // Garante que o casal existe

      await prismaTx.coupleInvite.delete({
        where: { id: couple.invite_id },
      })

      // ========== Shopping Lists ==========
      const shoppingLists = await prismaTx.shoppingList.findMany({
        where: { couple_id: coupleId },
        select: { id: true }, // Apenas precisamos dos IDs
      })
      const shoppingListIds = shoppingLists.map((list) => list.id)

      await prismaTx.shoppingListItem.deleteMany({
        where: {
          shopping_list_id: { in: shoppingListIds },
        },
      })

      await prismaTx.product.deleteMany({
        where: { couple_id: coupleId },
      })

      await prismaTx.shoppingList.deleteMany({
        where: { couple_id: coupleId },
      })

      // ========== Calendar Events ==========
      const calendarEvents = await prismaTx.calendarEvent.findMany({
        where: { couple_id: coupleId },
        select: { id: true },
      })
      const calendarEventIds = calendarEvents.map((event) => event.id)

      // Deletar exceções de eventos antes dos eventos
      await prismaTx.calendarEventException.deleteMany({
        where: {
          calendar_event_id: { in: calendarEventIds },
        },
      })

      await prismaTx.calendarEvent.deleteMany({
        where: { couple_id: coupleId },
      })

      // ========== Household Tasks ==========
      const householdTasks = await prismaTx.householdTask.findMany({
        where: { couple_id: coupleId },
        select: { id: true },
      })
      const householdTaskIds = householdTasks.map((task) => task.id)

      // Deletar conclusões de tarefas
      await prismaTx.householdTaskCompletion.deleteMany({
        where: {
          household_task_id: { in: householdTaskIds },
        },
      })

      // Deletar exceções de tarefas
      await prismaTx.householdTaskException.deleteMany({
        where: {
          household_task_id: { in: householdTaskIds },
        },
      })

      await prismaTx.householdTask.deleteMany({
        where: { couple_id: coupleId },
      })

      // ========== Couple ==========
      // Desvincula os usuários do casal
      await prismaTx.user.updateMany({
        where: { couple_id: coupleId },
        data: { couple_id: null },
      })

      // Deleta o registro do casal
      await prismaTx.couple.delete({
        where: { id: coupleId },
      })
    }

    if (tx) {
      await transactionLogic(tx)
    } else {
      await prisma.$transaction(async (newTx) => {
        await transactionLogic(newTx as unknown as PrismaClient)
      })
    }
  }
}
