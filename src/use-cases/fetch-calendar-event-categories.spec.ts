import { beforeEach, describe, expect, it } from 'vitest'
import { FetchCalendarEventCategoriesUseCase } from './fetch-calendar-event-categories'
import { InMemoryCalendarEventCategoriesRepository } from '@/repositories/in-memory/in-memory-calendar-event-categories-repository'

let categoriesRepository: InMemoryCalendarEventCategoriesRepository
let sut: FetchCalendarEventCategoriesUseCase

describe('Fetch Calendar Event Categories Use Case', () => {
  beforeEach(() => {
    categoriesRepository = new InMemoryCalendarEventCategoriesRepository()
    sut = new FetchCalendarEventCategoriesUseCase(categoriesRepository)
  })

  it('should be able to fetch all calendar event categories', async () => {
    await categoriesRepository.create({
      name: 'Personal',
      color: '#FF0000',
    })

    await categoriesRepository.create({
      name: 'Work',
      color: '#00FF00',
    })

    const { categories } = await sut.execute()

    expect(categories).toHaveLength(2)
    expect(categories[0].name).toBe('Personal')
    expect(categories[1].name).toBe('Work')
  })

  it('should return empty array if no categories exist', async () => {
    const { categories } = await sut.execute()

    expect(categories).toHaveLength(0)
    expect(categories).toEqual([])
  })

  it('should return all category properties', async () => {
    await categoriesRepository.create({
      name: 'Personal',
      color: '#FF0000',
    })

    const { categories } = await sut.execute()

    expect(categories[0]).toHaveProperty('id')
    expect(categories[0]).toHaveProperty('name')
    expect(categories[0]).toHaveProperty('color')
  })
})
