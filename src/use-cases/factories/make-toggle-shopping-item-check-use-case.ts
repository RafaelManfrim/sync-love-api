import { PrismaShoppingListItemsRepository } from '@/repositories/prisma/prisma-shopping-list-items-repository'
import { ToggleShoppingItemCheckUseCase } from '../toggle-shopping-item-check'

export function makeToggleShoppingItemCheckUseCase() {
  const shoppingItemsRepository = new PrismaShoppingListItemsRepository()
  const useCase = new ToggleShoppingItemCheckUseCase(shoppingItemsRepository)

  return useCase
}
