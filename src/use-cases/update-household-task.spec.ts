import { beforeEach, describe, expect, it } from 'vitest'
import { UpdateHouseholdTaskUseCase } from './update-household-task'
import { InMemoryHouseholdTasksRepository } from '@/repositories/in-memory/in-memory-household-tasks-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'

let householdTasksRepository: InMemoryHouseholdTasksRepository
let usersRepository: InMemoryUsersRepository
let sut: UpdateHouseholdTaskUseCase

describe('Update Household Task Use Case', () => {
  beforeEach(() => {
    householdTasksRepository = new InMemoryHouseholdTasksRepository()
    usersRepository = new InMemoryUsersRepository()
    sut = new UpdateHouseholdTaskUseCase(
      householdTasksRepository,
      usersRepository,
    )
  })

  it('should be able to update a household task', async () => {
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

    const { householdTask } = await sut.execute({
      userId: user.id,
      taskId: task.id,
      data: {
        title: 'Deep clean the kitchen',
        description: 'Including the oven',
      },
    })

    expect(householdTask.title).toBe('Deep clean the kitchen')
    expect(householdTask.description).toBe('Including the oven')
  })

  it('should not be able to update a task if user does not exist', async () => {
    await expect(() =>
      sut.execute({
        userId: 999,
        taskId: 1,
        data: { title: 'New title' },
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update a task if user does not have a couple', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: null,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        taskId: 1,
        data: { title: 'New title' },
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update a task that does not exist', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        taskId: 999,
        data: { title: 'New title' },
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update a task from another couple', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const task = await householdTasksRepository.create({
      author_id: 2,
      couple_id: 2,
      title: 'Clean the kitchen',
      start_date: new Date('2025-01-15'),
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        taskId: task.id,
        data: { title: 'New title' },
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('should be able to update only specific fields', async () => {
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
      description: 'Original description',
      start_date: new Date('2025-01-15'),
    })

    const { householdTask } = await sut.execute({
      userId: user.id,
      taskId: task.id,
      data: {
        title: 'New title only',
      },
    })

    expect(householdTask.title).toBe('New title only')
    expect(householdTask.description).toBe('Original description')
  })
})
