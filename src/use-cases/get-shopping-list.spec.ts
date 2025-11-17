import { beforeEach, describe, expect, it } from 'vitest'
import { GetShoppingListUseCase } from './get-shopping-list'
import { InMemoryShoppingListsRepository } from '@/repositories/in-memory/in-memory-shopping-lists-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'

let shoppingListsRepository: InMemoryShoppingListsRepository
let sut: GetShoppingListUseCase

describe('Get Shopping List Use Case', () => {
  beforeEach(() => {
    shoppingListsRepository = new InMemoryShoppingListsRepository()
    sut = new GetShoppingListUseCase(shoppingListsRepository)
  })

  it('should be able to get a shopping list by id', async () => {
    const list = await shoppingListsRepository.create({
      couple_id: 1,
      author_id: 1,
      name: 'Weekly Groceries',
    })

    const { shoppingList } = await sut.execute({
      listId: list.id,
      coupleId: 1,
    })

    expect(shoppingList.id).toBe(list.id)
    expect(shoppingList.name).toBe('Weekly Groceries')
    expect(shoppingList.couple_id).toBe(1)
  })

  it('should not be able to get a list that does not exist', async () => {
    await expect(() =>
      sut.execute({
        listId: 999,
        coupleId: 1,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to get a list from another couple', async () => {
    const list = await shoppingListsRepository.create({
      couple_id: 2,
      author_id: 2,
      name: 'Weekly Groceries',
    })

    await expect(() =>
      sut.execute({
        listId: list.id,
        coupleId: 1, // Different couple
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('should return list with all properties', async () => {
    const list = await shoppingListsRepository.create({
      couple_id: 1,
      author_id: 1,
      name: 'Weekly Groceries',
    })

    const { shoppingList } = await sut.execute({
      listId: list.id,
      coupleId: 1,
    })

    expect(shoppingList).toHaveProperty('id')
    expect(shoppingList).toHaveProperty('name')
    expect(shoppingList).toHaveProperty('couple_id')
    expect(shoppingList).toHaveProperty('author_id')
    expect(shoppingList).toHaveProperty('created_at')
    expect(shoppingList).toHaveProperty('updated_at')
    expect(shoppingList).toHaveProperty('closed_at')
    expect(shoppingList).toHaveProperty('ShoppingListItem')
  })
})
