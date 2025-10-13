import { PrismaShoppingListsRepository } from '@/repositories/prisma/prisma-shopping-lists-repository'
import { ListCoupleShoppingListsUseCase } from '../list-couple-shopping-lists'

export function makeListCoupleShoppingListsUseCase() {
  const shoppingListsRepository = new PrismaShoppingListsRepository()
  const useCase = new ListCoupleShoppingListsUseCase(shoppingListsRepository)

  return useCase
}
