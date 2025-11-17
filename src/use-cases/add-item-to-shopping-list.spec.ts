import { beforeEach, describe, expect, it } from 'vitest'
import { AddItemToShoppingListUseCase } from './add-item-to-shopping-list'
import { InMemoryShoppingListsRepository } from '@/repositories/in-memory/in-memory-shopping-lists-repository'
import { InMemoryProductsRepository } from '@/repositories/in-memory/in-memory-products-repository'
import { InMemoryShoppingListItemsRepository } from '@/repositories/in-memory/in-memory-shopping-list-items-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'
import { ShoppingListAlreadyClosedError } from './errors/shopping-list-already-closed-error'

let shoppingListsRepository: InMemoryShoppingListsRepository
let productsRepository: InMemoryProductsRepository
let shoppingListItemsRepository: InMemoryShoppingListItemsRepository
let sut: AddItemToShoppingListUseCase

describe('Add Item to Shopping List Use Case', () => {
  beforeEach(() => {
    shoppingListsRepository = new InMemoryShoppingListsRepository()
    productsRepository = new InMemoryProductsRepository()
    shoppingListItemsRepository = new InMemoryShoppingListItemsRepository()
    sut = new AddItemToShoppingListUseCase(
      shoppingListsRepository,
      productsRepository,
      shoppingListItemsRepository,
    )
  })

  it('should be able to add an existing product to shopping list', async () => {
    const list = await shoppingListsRepository.create({
      name: 'Weekly Groceries',
      couple_id: 1,
      author_id: 1,
    })

    const product = await productsRepository.create({
      name: 'Apple',
      unit_of_measure: 'QUANTITY',
      couple_id: 1,
    })

    const { shoppingItem } = await sut.execute({
      itemName: 'Apple',
      shoppingListId: list.id,
      userId: 1,
      coupleId: 1,
      quantity: 5,
    })

    expect(shoppingItem.product_id).toBe(product.id)
    expect(shoppingItem.shopping_list_id).toBe(list.id)
    expect(shoppingItem.quantity).toBe(5)
  })

  it('should create a new product if it does not exist', async () => {
    const list = await shoppingListsRepository.create({
      name: 'Weekly Groceries',
      couple_id: 1,
      author_id: 1,
    })

    const { shoppingItem } = await sut.execute({
      itemName: 'Banana',
      shoppingListId: list.id,
      userId: 1,
      coupleId: 1,
      unitOfMeasure: 'WEIGHT',
      quantity: 2,
    })

    const products = await productsRepository.listByCouple(1)
    expect(products).toHaveLength(1)
    expect(products[0].name).toBe('Banana')
    expect(products[0].unit_of_measure).toBe('WEIGHT')

    expect(shoppingItem.quantity).toBe(2)
  })

  it('should use default quantity of 1 if not provided', async () => {
    const list = await shoppingListsRepository.create({
      name: 'Weekly Groceries',
      couple_id: 1,
      author_id: 1,
    })

    const { shoppingItem } = await sut.execute({
      itemName: 'Orange',
      shoppingListId: list.id,
      userId: 1,
      coupleId: 1,
    })

    expect(shoppingItem.quantity).toBe(1)
  })

  it('should use QUANTITY as default unit of measure', async () => {
    const list = await shoppingListsRepository.create({
      name: 'Weekly Groceries',
      couple_id: 1,
      author_id: 1,
    })

    await sut.execute({
      itemName: 'Tomato',
      shoppingListId: list.id,
      userId: 1,
      coupleId: 1,
    })

    const products = await productsRepository.listByCouple(1)
    expect(products[0].unit_of_measure).toBe('QUANTITY')
  })

  it('should not be able to add item if shopping list does not exist', async () => {
    await expect(() =>
      sut.execute({
        itemName: 'Apple',
        shoppingListId: 999,
        userId: 1,
        coupleId: 1,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to add item if list belongs to another couple', async () => {
    const list = await shoppingListsRepository.create({
      name: 'Weekly Groceries',
      couple_id: 2,
      author_id: 2,
    })

    await expect(() =>
      sut.execute({
        itemName: 'Apple',
        shoppingListId: list.id,
        userId: 1,
        coupleId: 1,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('should not be able to add item to a closed shopping list', async () => {
    const list = await shoppingListsRepository.create({
      name: 'Weekly Groceries',
      couple_id: 1,
      author_id: 1,
      closed_at: new Date(),
    })

    await expect(() =>
      sut.execute({
        itemName: 'Apple',
        shoppingListId: list.id,
        userId: 1,
        coupleId: 1,
      }),
    ).rejects.toBeInstanceOf(ShoppingListAlreadyClosedError)
  })

  it('should add item with correct author_id', async () => {
    const list = await shoppingListsRepository.create({
      name: 'Weekly Groceries',
      couple_id: 1,
      author_id: 1,
    })

    const { shoppingItem } = await sut.execute({
      itemName: 'Milk',
      shoppingListId: list.id,
      userId: 5,
      coupleId: 1,
    })

    expect(shoppingItem.author_id).toBe(5)
  })
})
