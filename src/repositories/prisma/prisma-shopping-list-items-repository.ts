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
        shopping_list: true,
      },
    })
    return shoppingListItem
  }

  async save(data: ShoppingListItem): Promise<ShoppingListItem> {
    const { id, ...rest } = data

    const shoppingListItem = await prisma.shoppingListItem.update({
      where: {
        id,
      },
      data: {
        is_checked: rest.is_checked,
        unit_price: rest.unit_price,
        quantity: rest.quantity,
      },
    })
    return shoppingListItem
  }

  async findManyByIds(ids: number[]): Promise<ShoppingListItem[]> {
    const shoppingListItems = await prisma.shoppingListItem.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    })
    return shoppingListItems
  }
}
