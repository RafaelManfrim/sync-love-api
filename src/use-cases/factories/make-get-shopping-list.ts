import { PrismaShoppingListsRepository } from '@/repositories/prisma/prisma-shopping-lists-repository'
import { GetShoppingListUseCase } from '../get-shopping-list'

export function makeGetShoppingListUseCase() {
  const shoppingListsRepository = new PrismaShoppingListsRepository()
  const useCase = new GetShoppingListUseCase(shoppingListsRepository)

  return useCase
}
