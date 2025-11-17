import { beforeEach, describe, expect, it } from 'vitest'
import { ToggleShoppingItemCheckUseCase } from './toggle-shopping-item-check'
import { InMemoryShoppingListsRepository } from '@/repositories/in-memory/in-memory-shopping-lists-repository'
import { InMemoryShoppingListItemsRepository } from '@/repositories/in-memory/in-memory-shopping-list-items-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'

let shoppingListsRepository: InMemoryShoppingListsRepository
let shoppingItemsRepository: InMemoryShoppingListItemsRepository
let sut: ToggleShoppingItemCheckUseCase

describe('Toggle Shopping Item Check Use Case', () => {
  beforeEach(() => {
    shoppingListsRepository = new InMemoryShoppingListsRepository()
    shoppingItemsRepository = new InMemoryShoppingListItemsRepository()
    sut = new ToggleShoppingItemCheckUseCase(
      shoppingListsRepository,
      shoppingItemsRepository,
    )
  })

  it('should be able to toggle shopping item check status', async () => {
    const list = await shoppingListsRepository.create({
      name: 'Weekly Groceries',
      couple_id: 1,
      author_id: 1,
    })

    const item = await shoppingItemsRepository.create({
      shopping_list_id: list.id,
      product_id: 1,
      author_id: 1,
      is_checked: false,
      quantity: 1,
    })

    const { shoppingItem } = await sut.execute({
      shoppingItemId: item.id,
      coupleId: 1,
      listId: list.id,
    })

    expect(shoppingItem.is_checked).toBe(true)
  })

  it('should be able to toggle back to unchecked', async () => {
    const list = await shoppingListsRepository.create({
      name: 'Weekly Groceries',
      couple_id: 1,
      author_id: 1,
    })

    const item = await shoppingItemsRepository.create({
      shopping_list_id: list.id,
      product_id: 1,
      author_id: 1,
      is_checked: true,
      quantity: 1,
    })

    const { shoppingItem } = await sut.execute({
      shoppingItemId: item.id,
      coupleId: 1,
      listId: list.id,
    })

    expect(shoppingItem.is_checked).toBe(false)
  })

  it('should not be able to toggle if item does not exist', async () => {
    await expect(() =>
      sut.execute({
        shoppingItemId: 999,
        coupleId: 1,
        listId: 1,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to toggle if list does not exist', async () => {
    const list = await shoppingListsRepository.create({
      name: 'Weekly Groceries',
      couple_id: 1,
      author_id: 1,
    })

    const item = await shoppingItemsRepository.create({
      shopping_list_id: list.id,
      product_id: 1,
      author_id: 1,
      is_checked: false,
      quantity: 1,
    })

    await expect(() =>
      sut.execute({
        shoppingItemId: item.id,
        coupleId: 1,
        listId: 999,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to toggle if list belongs to another couple', async () => {
    const list = await shoppingListsRepository.create({
      name: 'Weekly Groceries',
      couple_id: 2,
      author_id: 2,
    })

    const item = await shoppingItemsRepository.create({
      shopping_list_id: list.id,
      product_id: 1,
      author_id: 2,
      is_checked: false,
      quantity: 1,
    })

    await expect(() =>
      sut.execute({
        shoppingItemId: item.id,
        coupleId: 1,
        listId: list.id,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })
})
