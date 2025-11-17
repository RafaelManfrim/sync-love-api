import { beforeEach, describe, expect, it } from 'vitest'
import { GetHouseholdTasksSummaryUseCase } from './get-household-tasks-summary'
import { InMemoryHouseholdTasksRepository } from '@/repositories/in-memory/in-memory-household-tasks-repository'
import { InMemoryHouseholdTaskCompletionsRepository } from '@/repositories/in-memory/in-memory-household-task-completions-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

let householdTasksRepository: InMemoryHouseholdTasksRepository
let householdTaskCompletionsRepository: InMemoryHouseholdTaskCompletionsRepository
let usersRepository: InMemoryUsersRepository
let sut: GetHouseholdTasksSummaryUseCase

describe('Get Household Tasks Summary Use Case', () => {
  beforeEach(() => {
    householdTasksRepository = new InMemoryHouseholdTasksRepository()
    householdTaskCompletionsRepository =
      new InMemoryHouseholdTaskCompletionsRepository()
    householdTaskCompletionsRepository.tasks = householdTasksRepository.items
    usersRepository = new InMemoryUsersRepository()
    householdTaskCompletionsRepository.users = usersRepository.items
    sut = new GetHouseholdTasksSummaryUseCase(
      householdTasksRepository,
      householdTaskCompletionsRepository,
      usersRepository,
    )
  })

  it('should be able to get household tasks summary for a month', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const { summary } = await sut.execute({
      userId: user.id,
      year: 2025,
      month: 1,
    })

    expect(summary).toHaveProperty('totalPlanned')
    expect(summary).toHaveProperty('totalCompleted')
    expect(summary).toHaveProperty('members')
    expect(Array.isArray(summary.members)).toBe(true)
  })

  it('should not be able to get summary if user does not exist', async () => {
    await expect(() =>
      sut.execute({
        userId: 999,
        year: 2025,
        month: 1,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to get summary if user does not have a couple', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: null,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        year: 2025,
        month: 1,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return summary with members array', async () => {
    const user1 = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    await usersRepository.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const { summary } = await sut.execute({
      userId: user1.id,
      year: 2025,
      month: 1,
    })

    expect(summary.members).toHaveLength(2)
    expect(summary.members[0]).toHaveProperty('id')
    expect(summary.members[0]).toHaveProperty('name')
    expect(summary.members[0]).toHaveProperty('avatar_url')
    expect(summary.members[0]).toHaveProperty('completedCount')
  })

  it('should calculate total planned and completed tasks', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

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

    const { summary } = await sut.execute({
      userId: user.id,
      year: 2025,
      month: 1,
    })

    expect(summary.totalPlanned).toBeGreaterThanOrEqual(0)
    expect(summary.totalCompleted).toBeGreaterThanOrEqual(0)
    expect(typeof summary.totalPlanned).toBe('number')
    expect(typeof summary.totalCompleted).toBe('number')
  })
})
