import { PrismaShoppingListsRepository } from '@/repositories/prisma/prisma-shopping-lists-repository'
import { ListCoupleShoppingListsUseCase } from '../list-couple-shopping-lists'
import { PrismaCouplesRepository } from '@/repositories/prisma/prisma-couples-repository'

export function makeListCoupleShoppingListsUseCase() {
  const shoppingListsRepository = new PrismaShoppingListsRepository()
  const couplesRepository = new PrismaCouplesRepository()
  const useCase = new ListCoupleShoppingListsUseCase(
    shoppingListsRepository,
    couplesRepository,
  )

  return useCase
}
