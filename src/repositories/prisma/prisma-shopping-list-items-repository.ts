import { prisma } from '@/lib/prisma'
import { Prisma, ShoppingListItem } from '@prisma/client'
import { ShoppingListItemsRepository } from '../shopping-list-items-repository'

export class PrismaShoppingListItemsRepository
  implements ShoppingListItemsRepository
{
  async create(
    data: Prisma.ShoppingListItemUncheckedCreateInput,
  ): Promise<ShoppingListItem> {
    const shoppingListItem = await prisma.shoppingListItem.create({
      data,
    })
    return shoppingListItem
  }

  async findById(id: number): Promise<ShoppingListItem | null> {
    const shoppingListItem = await prisma.shoppingListItem.findUnique({
      where: {
        id,
      },
      include: {
        // Incluir a lista para podermos verificar o dono
        shopping_list: true,
      },
    })
    return shoppingListItem
  }

  async save(data: ShoppingListItem): Promise<ShoppingListItem> {
    const shoppingListItem = await prisma.shoppingListItem.update({
      where: {
        id: data.id,
      },
      data,
    })
    return shoppingListItem
  }
}
