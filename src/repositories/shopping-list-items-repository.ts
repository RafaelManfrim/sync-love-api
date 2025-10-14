import { Prisma, ShoppingListItem } from '@prisma/client'

export interface ShoppingListItemsRepository {
  create(
    data: Prisma.ShoppingListItemUncheckedCreateInput,
  ): Promise<ShoppingListItem>
  findById(id: number): Promise<ShoppingListItem | null>
  save(data: ShoppingListItem): Promise<ShoppingListItem>
}
