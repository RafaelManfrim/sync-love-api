import { PrismaShoppingListsRepository } from '@/repositories/prisma/prisma-shopping-lists-repository'
import { CreateShoppingListUseCase } from '../create-shopping-list'

export function makeCreateShoppingListUseCase() {
  const shoppingListsRepository = new PrismaShoppingListsRepository()
  const useCase = new CreateShoppingListUseCase(shoppingListsRepository)

  return useCase
}
