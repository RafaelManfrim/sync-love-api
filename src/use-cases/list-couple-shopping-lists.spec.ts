import { beforeEach, describe, expect, it } from 'vitest'
import { ListCoupleShoppingListsUseCase } from './list-couple-shopping-lists'
import { InMemoryShoppingListsRepository } from '@/repositories/in-memory/in-memory-shopping-lists-repository'
import { InMemoryCouplesRepository } from '@/repositories/in-memory'

let shoppingListsRepository: InMemoryShoppingListsRepository
let couplesRepository: InMemoryCouplesRepository
let sut: ListCoupleShoppingListsUseCase

describe('List Couple Shopping Lists Use Case', () => {
  beforeEach(() => {
    shoppingListsRepository = new InMemoryShoppingListsRepository()
    couplesRepository = new InMemoryCouplesRepository()
    sut = new ListCoupleShoppingListsUseCase(
      shoppingListsRepository,
      couplesRepository,
    )
  })

  it('should be able to list all shopping lists of a couple', async () => {
    const couple = await couplesRepository.create({
      inviter_id: 1,
      invitee_id: 2,
      invite_id: 1,
    })

    const couple2 = await couplesRepository.create({
      inviter_id: 3,
      invitee_id: 4,
      invite_id: 2,
    })

    await shoppingListsRepository.create({
      name: 'Weekly Groceries',
      couple_id: couple.id,
      author_id: 1,
    })

    await shoppingListsRepository.create({
      name: 'Monthly Shopping',
      couple_id: couple.id,
      author_id: 1,
    })

    await shoppingListsRepository.create({
      name: 'Other Couple List',
      couple_id: couple2.id,
      author_id: 3,
    })

    const { shoppingLists } = await sut.execute({ coupleId: couple.id })

    expect(shoppingLists).toHaveLength(2)
    expect(shoppingLists[0].couple_id).toBe(couple.id)
    expect(shoppingLists[1].couple_id).toBe(couple.id)
  })

  it('should return empty array if couple has no shopping lists', async () => {
    const couple = await couplesRepository.create({
      inviter_id: 5,
      invitee_id: 6,
      invite_id: 3,
    })

    const { shoppingLists } = await sut.execute({ coupleId: couple.id })

    expect(shoppingLists).toHaveLength(0)
  })
})
