import { beforeEach, describe, expect, it } from 'vitest'
import { FetchHouseholdTasksUseCase } from './fetch-household-taks'
import { InMemoryHouseholdTasksRepository } from '@/repositories/in-memory/in-memory-household-tasks-repository'

let householdTasksRepository: InMemoryHouseholdTasksRepository
let sut: FetchHouseholdTasksUseCase

describe('Fetch Household Tasks Use Case', () => {
  beforeEach(() => {
    householdTasksRepository = new InMemoryHouseholdTasksRepository()
    sut = new FetchHouseholdTasksUseCase(householdTasksRepository)
  })

  it('should be able to fetch all household tasks for a couple', async () => {
    await householdTasksRepository.create({
      author_id: 1,
      couple_id: 1,
      title: 'Clean the kitchen',
      start_date: new Date('2025-01-15'),
    })

    await householdTasksRepository.create({
      author_id: 1,
      couple_id: 1,
      title: 'Do laundry',
      start_date: new Date('2025-01-16'),
    })

    await householdTasksRepository.create({
      author_id: 2,
      couple_id: 2,
      title: 'Other couple task',
      start_date: new Date('2025-01-17'),
    })

    const { tasks } = await sut.execute({
      coupleId: 1,
    })

    expect(tasks).toHaveLength(2)
    expect(tasks[0].title).toBe('Clean the kitchen')
    expect(tasks[1].title).toBe('Do laundry')
  })

  it('should return empty array if couple has no tasks', async () => {
    const { tasks } = await sut.execute({
      coupleId: 999,
    })

    expect(tasks).toHaveLength(0)
    expect(tasks).toEqual([])
  })

  it('should not return tasks from other couples', async () => {
    await householdTasksRepository.create({
      author_id: 1,
      couple_id: 1,
      title: 'Clean the kitchen',
      start_date: new Date('2025-01-15'),
    })

    await householdTasksRepository.create({
      author_id: 2,
      couple_id: 2,
      title: 'Other couple task',
      start_date: new Date('2025-01-16'),
    })

    const { tasks } = await sut.execute({
      coupleId: 1,
    })

    expect(tasks).toHaveLength(1)
    expect(tasks[0].couple_id).toBe(1)
  })

  it('should return tasks with all properties', async () => {
    await householdTasksRepository.create({
      author_id: 1,
      couple_id: 1,
      title: 'Clean the kitchen',
      description: 'Deep clean',
      start_date: new Date('2025-01-15'),
      recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
    })

    const { tasks } = await sut.execute({
      coupleId: 1,
    })

    expect(tasks[0]).toHaveProperty('id')
    expect(tasks[0]).toHaveProperty('title')
    expect(tasks[0]).toHaveProperty('description')
    expect(tasks[0]).toHaveProperty('start_date')
    expect(tasks[0]).toHaveProperty('recurrence_rule')
    expect(tasks[0]).toHaveProperty('author_id')
    expect(tasks[0]).toHaveProperty('couple_id')
    expect(tasks[0]).toHaveProperty('created_at')
    expect(tasks[0]).toHaveProperty('updated_at')
    expect(tasks[0]).toHaveProperty('deleted_at')
  })
})
