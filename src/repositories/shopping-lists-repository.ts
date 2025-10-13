import { Prisma, ShoppingList } from '@prisma/client'

export interface ShoppingListsRepository {
  create(data: Prisma.ShoppingListUncheckedCreateInput): Promise<ShoppingList>
  listByCoupleId(coupleId: number): Promise<ShoppingList[]>
}
