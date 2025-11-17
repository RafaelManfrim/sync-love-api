import { beforeEach, describe, expect, it } from 'vitest'
import { GetHouseholdTaskDetailsUseCase } from './get-household-task-details'
import { InMemoryHouseholdTasksRepository } from '@/repositories/in-memory/in-memory-household-tasks-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'

let householdTasksRepository: InMemoryHouseholdTasksRepository
let usersRepository: InMemoryUsersRepository
let sut: GetHouseholdTaskDetailsUseCase

describe('Get Household Task Details Use Case', () => {
  beforeEach(() => {
    householdTasksRepository = new InMemoryHouseholdTasksRepository()
    usersRepository = new InMemoryUsersRepository()
    sut = new GetHouseholdTaskDetailsUseCase(
      householdTasksRepository,
      usersRepository,
    )
  })

  it('should be able to get household task details', async () => {
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
      description: 'Deep clean all surfaces',
      start_date: new Date('2025-01-15'),
      recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
    })

    const { task: taskDetails } = await sut.execute({
      userId: user.id,
      taskId: task.id,
    })

    expect(taskDetails.id).toBe(task.id)
    expect(taskDetails.title).toBe('Clean the kitchen')
    expect(taskDetails.description).toBe('Deep clean all surfaces')
    expect(taskDetails.recurrence_rule).toBe('FREQ=WEEKLY;BYDAY=MO')
  })

  it('should not be able to get task details if user does not exist', async () => {
    await expect(() =>
      sut.execute({
        userId: 999,
        taskId: 1,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to get task details if user does not have a couple', async () => {
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

  it('should not be able to get task details if task does not exist', async () => {
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

  it('should not be able to get task details if task is soft deleted', async () => {
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

    await householdTasksRepository.softDeleteById(task.id)

    await expect(() =>
      sut.execute({
        userId: user.id,
        taskId: task.id,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to get task details from another couple', async () => {
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
})
