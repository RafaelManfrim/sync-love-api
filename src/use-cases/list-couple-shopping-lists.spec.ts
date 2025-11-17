import { beforeEach, describe, expect, it } from 'vitest'
import { ListCoupleShoppingListsUseCase } from './list-couple-shopping-lists'
import { InMemoryShoppingListsRepository } from '@/repositories/in-memory/in-memory-shopping-lists-repository'

let shoppingListsRepository: InMemoryShoppingListsRepository
let sut: ListCoupleShoppingListsUseCase

describe('List Couple Shopping Lists Use Case', () => {
  beforeEach(() => {
    shoppingListsRepository = new InMemoryShoppingListsRepository()
    sut = new ListCoupleShoppingListsUseCase(shoppingListsRepository)
  })

  it('should be able to list all shopping lists of a couple', async () => {
    await shoppingListsRepository.create({
      name: 'Weekly Groceries',
      couple_id: 1,
      author_id: 1,
    })

    await shoppingListsRepository.create({
      name: 'Monthly Shopping',
      couple_id: 1,
      author_id: 1,
    })

    await shoppingListsRepository.create({
      name: 'Other Couple List',
      couple_id: 2,
      author_id: 2,
    })

    const { shoppingLists } = await sut.execute({ coupleId: 1 })

    expect(shoppingLists).toHaveLength(2)
    expect(shoppingLists[0].couple_id).toBe(1)
    expect(shoppingLists[1].couple_id).toBe(1)
  })

  it('should return empty array if couple has no shopping lists', async () => {
    const { shoppingLists } = await sut.execute({ coupleId: 999 })

    expect(shoppingLists).toHaveLength(0)
  })
})
