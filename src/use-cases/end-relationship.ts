import { prisma } from '@/lib/prisma'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface EndRelationshipUseCaseRequest {
  coupleId: number
}

export class EndRelationshipUseCase {
  async execute({ coupleId }: EndRelationshipUseCaseRequest) {
    await prisma.$transaction(async (tx) => {
      // Garante que o casal existe
      const couple = await tx.couple.findUnique({ where: { id: coupleId } })
      if (!couple) {
        throw new ResourceNotFoundError()
      }

      await tx.coupleInvite.delete({
        where: { id: couple.invite_id },
      })

      const shoppingLists = await tx.shoppingList.findMany({
        where: { couple_id: coupleId },
        select: { id: true }, // Apenas precisamos dos IDs
      })
      const shoppingListIds = shoppingLists.map((list) => list.id)

      await tx.shoppingListItem.deleteMany({
        where: {
          shopping_list_id: { in: shoppingListIds },
        },
      })

      await tx.product.deleteMany({
        where: { couple_id: coupleId },
      })

      await tx.shoppingList.deleteMany({
        where: { couple_id: coupleId },
      })

      // Desvincula os usuários do casal
      await tx.user.updateMany({
        where: { couple_id: coupleId },
        data: { couple_id: null },
      })

      // Deleta o registro do casal
      await tx.couple.delete({
        where: { id: coupleId },
      })
    })
  }
}
