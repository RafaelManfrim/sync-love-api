import { beforeEach, describe, expect, test } from 'vitest'

import { CreateShoppingListUseCase } from './create-shopping-list'
import { InMemoryShoppingListsRepository } from '@repositories/in-memory/in-memory-shopping-lists-repository'

let shoppingListsRepository: InMemoryShoppingListsRepository
let sut: CreateShoppingListUseCase

describe('Create Shopping List Use Case', () => {
  beforeEach(() => {
    shoppingListsRepository = new InMemoryShoppingListsRepository()
    sut = new CreateShoppingListUseCase(shoppingListsRepository)
  })

  test('should be able to create a new shopping list', async () => {
    const { shoppingList } = await sut.execute({
      title: 'Supermercado',
      coupleId: 1,
      authorId: 1,
    })

    expect(shoppingList.id).toEqual(expect.any(Number))
    expect(shoppingList.name).toBe('Supermercado')
    expect(shoppingList.couple_id).toBe(1)
    expect(shoppingList.author_id).toBe(1)
    expect(shoppingList.created_at).toBeInstanceOf(Date)
    expect(shoppingList.updated_at).toBeInstanceOf(Date)
    expect(shoppingList.closed_at).toBeNull()
  })

  test('should be able to create shopping list without title', async () => {
    const { shoppingList } = await sut.execute({
      title: '',
      coupleId: 1,
      authorId: 1,
    })

    expect(shoppingList.id).toEqual(expect.any(Number))
    expect(shoppingList.name).toBe('')
  })

  test('should be able to create multiple shopping lists for same couple', async () => {
    const { shoppingList: list1 } = await sut.execute({
      title: 'Supermercado',
      coupleId: 1,
      authorId: 1,
    })

    const { shoppingList: list2 } = await sut.execute({
      title: 'Feira',
      coupleId: 1,
      authorId: 2,
    })

    expect(list1.id).not.toBe(list2.id)
    expect(list1.couple_id).toBe(list2.couple_id)
    expect(list1.author_id).not.toBe(list2.author_id)
  })

  test('should store shopping list in repository', async () => {
    await sut.execute({
      title: 'Supermercado',
      coupleId: 1,
      authorId: 1,
    })

    const lists = await shoppingListsRepository.listByCoupleId(1)

    expect(lists).toHaveLength(1)
    expect(lists[0].name).toBe('Supermercado')
  })

  test('should create shopping list with correct initial state', async () => {
    const { shoppingList } = await sut.execute({
      title: 'Mercado',
      coupleId: 1,
      authorId: 1,
    })

    expect(shoppingList.closed_at).toBeNull()
  })
})
