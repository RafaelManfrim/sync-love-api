import { PrismaShoppingListItemsRepository } from '@/repositories/prisma/prisma-shopping-list-items-repository'
import { ToggleShoppingItemCheckUseCase } from '../toggle-shopping-item-check'
import { PrismaShoppingListsRepository } from '@/repositories/prisma/prisma-shopping-lists-repository'

export function makeToggleShoppingItemCheckUseCase() {
  const shoppingListsRepository = new PrismaShoppingListsRepository()
  const shoppingItemsRepository = new PrismaShoppingListItemsRepository()
  const useCase = new ToggleShoppingItemCheckUseCase(
    shoppingListsRepository,
    shoppingItemsRepository,
  )

  return useCase
}
