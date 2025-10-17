import { PrismaShoppingListsRepository } from '@/repositories/prisma/prisma-shopping-lists-repository'
import { CloseShoppingListUseCase } from '../close-shopping-list'
import { PrismaShoppingListItemsRepository } from '@/repositories/prisma/prisma-shopping-list-items-repository'

export function makeCloseShoppingListUseCase() {
  const shoppingListsRepository = new PrismaShoppingListsRepository()
  const shoppingListItemsRepository = new PrismaShoppingListItemsRepository()

  const useCase = new CloseShoppingListUseCase(
    shoppingListsRepository,
    shoppingListItemsRepository,
  )

  return useCase
}
