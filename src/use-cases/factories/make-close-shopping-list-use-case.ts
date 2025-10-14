import { PrismaPurchasesRepository } from '@/repositories/prisma/prisma-purchases-repository'
import { PrismaShoppingItemsRepository } from '@/repositories/prisma/prisma-shopping-items-repository'
import { PrismaShoppingListsRepository } from '@/repositories/prisma/prisma-shopping-lists-repository'
import { CloseShoppingListUseCase } from '../close-shopping-list'

export function makeCloseShoppingListUseCase() {
  const shoppingListsRepository = new PrismaShoppingListsRepository()
  const shoppingItemsRepository = new PrismaShoppingItemsRepository()
  const purchasesRepository = new PrismaPurchasesRepository()

  const useCase = new CloseShoppingListUseCase(
    shoppingListsRepository,
    shoppingItemsRepository,
    purchasesRepository,
  )

  return useCase
}
