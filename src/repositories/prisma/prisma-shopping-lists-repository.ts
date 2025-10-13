import { prisma } from '@/lib/prisma'
import { Prisma, ShoppingList } from '@prisma/client'
import { ShoppingListsRepository } from '../shopping-lists-repository'

export class PrismaShoppingListsRepository implements ShoppingListsRepository {
  async create(
    data: Prisma.ShoppingListUncheckedCreateInput,
  ): Promise<ShoppingList> {
    const shoppingList = await prisma.shoppingList.create({
      data,
    })

    return shoppingList
  }

  async listByCoupleId(coupleId: number): Promise<ShoppingList[]> {
    const shoppingLists = await prisma.shoppingList.findMany({
      where: {
        couple_id: coupleId,
      },
    })

    return shoppingLists
  }
}
