import { beforeEach, describe, expect, it } from 'vitest'
import { DeleteHouseholdTaskUseCase } from './delete-household-task'
import { InMemoryHouseholdTasksRepository } from '@/repositories/in-memory/in-memory-household-tasks-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'

let householdTasksRepository: InMemoryHouseholdTasksRepository
let usersRepository: InMemoryUsersRepository
let sut: DeleteHouseholdTaskUseCase

describe('Delete Household Task Use Case', () => {
  beforeEach(() => {
    householdTasksRepository = new InMemoryHouseholdTasksRepository()
    usersRepository = new InMemoryUsersRepository()
    sut = new DeleteHouseholdTaskUseCase(
      householdTasksRepository,
      usersRepository,
    )
  })

  it('should be able to soft delete a household task', async () => {
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

    expect(task.deleted_at).toBeNull()

    await sut.execute({
      userId: user.id,
      taskId: task.id,
    })

    const deletedTask = await householdTasksRepository.findById(task.id)
    expect(deletedTask).not.toBeNull()
    expect(deletedTask!.deleted_at).toBeInstanceOf(Date)
  })

  it('should not be able to delete a task if user does not exist', async () => {
    await expect(() =>
      sut.execute({
        userId: 999,
        taskId: 1,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete a task if user does not have a couple', async () => {
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
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete a task that does not exist', async () => {
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
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete a task from another couple', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const task = await householdTasksRepository.create({
      author_id: 2,
      couple_id: 2, // Different couple
      title: 'Clean the kitchen',
      start_date: new Date('2025-01-15'),
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        taskId: task.id,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('should keep the task in the repository after soft delete', async () => {
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

    await sut.execute({
      userId: user.id,
      taskId: task.id,
    })

    expect(householdTasksRepository.items).toHaveLength(1)
  })
})
