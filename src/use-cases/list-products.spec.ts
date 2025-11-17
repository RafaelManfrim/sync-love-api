import { beforeEach, describe, expect, it } from 'vitest'
import { ListProductsUseCase } from './list-products'
import { InMemoryProductsRepository } from '@/repositories/in-memory/in-memory-products-repository'

let productsRepository: InMemoryProductsRepository
let sut: ListProductsUseCase

describe('List Products Use Case', () => {
  beforeEach(() => {
    productsRepository = new InMemoryProductsRepository()
    sut = new ListProductsUseCase(productsRepository)
  })

  it('should be able to list all products of a couple', async () => {
    await productsRepository.create({
      name: 'Apple',
      unit_of_measure: 'QUANTITY',
      couple_id: 1,
    })

    await productsRepository.create({
      name: 'Banana',
      unit_of_measure: 'QUANTITY',
      couple_id: 1,
    })

    await productsRepository.create({
      name: 'Orange',
      unit_of_measure: 'QUANTITY',
      couple_id: 2,
    })

    const { products } = await sut.execute({ coupleId: 1 })

    expect(products).toHaveLength(2)
    expect(products[0].couple_id).toBe(1)
    expect(products[1].couple_id).toBe(1)
  })

  it('should return empty array if couple has no products', async () => {
    const { products } = await sut.execute({ coupleId: 999 })

    expect(products).toHaveLength(0)
  })
})
