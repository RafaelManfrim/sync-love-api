import { Prisma, ShoppingList } from '@prisma/client'

export type ShoppingListWithAveragePrice = ShoppingList & {
  ShoppingListItem: Array<
    Prisma.ShoppingListItemGetPayload<{
      include: { product: true }
    }> & {
      average_price: Prisma.Decimal | null
    }
  >
}

export interface ShoppingListsRepository {
  create(data: Prisma.ShoppingListUncheckedCreateInput): Promise<ShoppingList>
  listByCoupleId(coupleId: number): Promise<ShoppingList[]>
  findById(id: number): Promise<ShoppingListWithAveragePrice | null>
}
