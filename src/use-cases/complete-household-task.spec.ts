import { beforeEach, describe, expect, it } from 'vitest'
import { CompleteHouseholdTaskUseCase } from './complete-household-task'
import { InMemoryHouseholdTasksRepository } from '@/repositories/in-memory/in-memory-household-tasks-repository'
import { InMemoryHouseholdTaskCompletionsRepository } from '@/repositories/in-memory/in-memory-household-task-completions-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'
import { TaskAlreadyCompletedError } from './errors/task-already-completed-error'

let householdTasksRepository: InMemoryHouseholdTasksRepository
let householdTaskCompletionsRepository: InMemoryHouseholdTaskCompletionsRepository
let usersRepository: InMemoryUsersRepository
let sut: CompleteHouseholdTaskUseCase

describe('Complete Household Task Use Case', () => {
  beforeEach(() => {
    householdTasksRepository = new InMemoryHouseholdTasksRepository()
    householdTaskCompletionsRepository =
      new InMemoryHouseholdTaskCompletionsRepository()
    usersRepository = new InMemoryUsersRepository()
    householdTaskCompletionsRepository.tasks = householdTasksRepository.items
    sut = new CompleteHouseholdTaskUseCase(
      householdTasksRepository,
      householdTaskCompletionsRepository,
      usersRepository,
    )
  })

  it('should be able to complete a household task', async () => {
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

    const dueDate = new Date('2025-01-15')

    const { completion } = await sut.execute({
      userId: user.id,
      taskId: task.id,
      taskDueDate: dueDate,
    })

    expect(completion.household_task_id).toBe(task.id)
    expect(completion.completed_by_user_id).toBe(user.id)
    expect(completion.task_due_date).toEqual(dueDate)
  })

  it('should not be able to complete a task if user does not exist', async () => {
    await expect(() =>
      sut.execute({
        userId: 999,
        taskId: 1,
        taskDueDate: new Date('2025-01-15'),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to complete a task if user does not have a couple', async () => {
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
        taskDueDate: new Date('2025-01-15'),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to complete a task that does not exist', async () => {
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
        taskDueDate: new Date('2025-01-15'),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to complete a task from another couple', async () => {
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
        taskDueDate: new Date('2025-01-15'),
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('should not be able to complete a task twice for the same date', async () => {
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

    const dueDate = new Date('2025-01-15')

    await sut.execute({
      userId: user.id,
      taskId: task.id,
      taskDueDate: dueDate,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        taskId: task.id,
        taskDueDate: dueDate,
      }),
    ).rejects.toBeInstanceOf(TaskAlreadyCompletedError)
  })

  it('should be able to complete the same task on different dates', async () => {
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
      taskDueDate: new Date('2025-01-15'),
    })

    const { completion } = await sut.execute({
      userId: user.id,
      taskId: task.id,
      taskDueDate: new Date('2025-01-16'),
    })

    expect(completion.task_due_date).toEqual(new Date('2025-01-16'))
  })
})
