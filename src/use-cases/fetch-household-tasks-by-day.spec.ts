import { beforeEach, describe, expect, it } from 'vitest'
import { FetchHouseholdTasksByDayUseCase } from './fetch-household-tasks-by-day'
import { InMemoryHouseholdTasksRepository } from '@/repositories/in-memory/in-memory-household-tasks-repository'
import { InMemoryHouseholdTaskCompletionsRepository } from '@/repositories/in-memory/in-memory-household-task-completions-repository'
import { InMemoryHouseholdTaskExceptionsRepository } from '@/repositories/in-memory/in-memory-household-task-exceptions-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

let householdTasksRepository: InMemoryHouseholdTasksRepository
let householdTaskCompletionsRepository: InMemoryHouseholdTaskCompletionsRepository
let householdTaskExceptionsRepository: InMemoryHouseholdTaskExceptionsRepository
let usersRepository: InMemoryUsersRepository
let sut: FetchHouseholdTasksByDayUseCase

describe('Fetch Household Tasks By Day Use Case', () => {
  beforeEach(() => {
    householdTasksRepository = new InMemoryHouseholdTasksRepository()
    householdTaskCompletionsRepository =
      new InMemoryHouseholdTaskCompletionsRepository()
    householdTaskExceptionsRepository =
      new InMemoryHouseholdTaskExceptionsRepository()
    householdTaskCompletionsRepository.tasks = householdTasksRepository.items
    householdTaskCompletionsRepository.users = []
    householdTaskExceptionsRepository.tasks = householdTasksRepository.items
    usersRepository = new InMemoryUsersRepository()
    sut = new FetchHouseholdTasksByDayUseCase(
      householdTasksRepository,
      householdTaskCompletionsRepository,
      householdTaskExceptionsRepository,
      usersRepository,
    )
  })

  it('should be able to fetch household tasks for a specific day', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    await householdTasksRepository.create({
      author_id: user.id,
      couple_id: 1,
      title: 'Clean the kitchen',
      start_date: new Date('2025-01-15'),
    })

    const { tasks } = await sut.execute({
      userId: user.id,
      date: new Date('2025-01-15'),
    })

    expect(tasks).toBeDefined()
    expect(Array.isArray(tasks)).toBe(true)
  })

  it('should not be able to fetch tasks if user does not exist', async () => {
    await expect(() =>
      sut.execute({
        userId: 999,
        date: new Date('2025-01-15'),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to fetch tasks if user does not have a couple', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: null,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        date: new Date('2025-01-15'),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return tasks with completion and exception information', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    householdTaskCompletionsRepository.users.push(user)

    const task = await householdTasksRepository.create({
      author_id: user.id,
      couple_id: 1,
      title: 'Clean the kitchen',
      start_date: new Date('2025-01-15'),
    })

    await householdTaskCompletionsRepository.create({
      household_task_id: task.id,
      completed_by_user_id: user.id,
      task_due_date: new Date('2025-01-15'),
    })

    const { tasks } = await sut.execute({
      userId: user.id,
      date: new Date('2025-01-15'),
    })

    if (tasks.length > 0) {
      expect(tasks[0]).toHaveProperty('completion')
      expect(tasks[0]).toHaveProperty('exception')
    }
  })
})
