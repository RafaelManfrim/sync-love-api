import { beforeEach, describe, expect, it } from 'vitest'
import { CreateHouseholdTaskExceptionUseCase } from './create-household-task-exception'
import { InMemoryHouseholdTaskExceptionsRepository } from '@/repositories/in-memory/in-memory-household-task-exceptions-repository'
import { InMemoryHouseholdTasksRepository } from '@/repositories/in-memory/in-memory-household-tasks-repository'
import { InMemoryHouseholdTaskCompletionsRepository } from '@/repositories/in-memory/in-memory-household-task-completions-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'
import { TaskExceptionAlreadyExistsError } from './errors/task-exception-already-exists-error'

let householdTaskExceptionsRepository: InMemoryHouseholdTaskExceptionsRepository
let householdTasksRepository: InMemoryHouseholdTasksRepository
let householdTaskCompletionsRepository: InMemoryHouseholdTaskCompletionsRepository
let usersRepository: InMemoryUsersRepository
let sut: CreateHouseholdTaskExceptionUseCase

describe('Create Household Task Exception Use Case', () => {
  beforeEach(() => {
    householdTaskExceptionsRepository =
      new InMemoryHouseholdTaskExceptionsRepository()
    householdTasksRepository = new InMemoryHouseholdTasksRepository()
    householdTaskCompletionsRepository =
      new InMemoryHouseholdTaskCompletionsRepository()
    usersRepository = new InMemoryUsersRepository()
    sut = new CreateHouseholdTaskExceptionUseCase(
      householdTasksRepository,
      householdTaskCompletionsRepository,
      householdTaskExceptionsRepository,
      usersRepository,
    )
  })

  it('should be able to create a household task exception', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const task = await householdTasksRepository.create({
      author_id: user.id,
      couple_id: 1,
      title: 'Weekly Cleaning',
      start_date: new Date('2025-01-15'),
      recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
    })

    const exceptionDate = new Date('2025-01-22')

    const { exception } = await sut.execute({
      taskId: task.id,
      userId: user.id,
      exceptionDate,
    })

    expect(exception.id).toEqual(expect.any(Number))
    expect(exception.household_task_id).toBe(task.id)
    expect(exception.created_by_user_id).toBe(user.id)
    expect(exception.exception_date).toEqual(exceptionDate)
  })

  it('should not be able to create an exception if user does not exist', async () => {
    const exceptionDate = new Date('2025-01-22')

    await expect(() =>
      sut.execute({
        taskId: 1,
        userId: 999,
        exceptionDate,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create an exception if user does not have a couple', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: null,
    })

    const exceptionDate = new Date('2025-01-22')

    await expect(() =>
      sut.execute({
        taskId: 1,
        userId: user.id,
        exceptionDate,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create an exception if task does not exist', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const exceptionDate = new Date('2025-01-22')

    await expect(() =>
      sut.execute({
        taskId: 999,
        userId: user.id,
        exceptionDate,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create an exception if task belongs to another couple', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const task = await householdTasksRepository.create({
      author_id: user.id,
      couple_id: 2, // Different couple
      title: 'Weekly Cleaning',
      start_date: new Date('2025-01-15'),
      recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
    })

    const exceptionDate = new Date('2025-01-22')

    await expect(() =>
      sut.execute({
        taskId: task.id,
        userId: user.id,
        exceptionDate,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('should not be able to create a duplicate exception', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const task = await householdTasksRepository.create({
      author_id: user.id,
      couple_id: 1,
      title: 'Weekly Cleaning',
      start_date: new Date('2025-01-15'),
      recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
    })

    const exceptionDate = new Date('2025-01-22')

    await sut.execute({
      taskId: task.id,
      userId: user.id,
      exceptionDate,
    })

    await expect(() =>
      sut.execute({
        taskId: task.id,
        userId: user.id,
        exceptionDate,
      }),
    ).rejects.toBeInstanceOf(TaskExceptionAlreadyExistsError)
  })

  it('should delete existing completion when creating an exception', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const task = await householdTasksRepository.create({
      author_id: user.id,
      couple_id: 1,
      title: 'Weekly Cleaning',
      start_date: new Date('2025-01-15'),
      recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
    })

    const exceptionDate = new Date('2025-01-22')

    // Create a completion for the date
    await householdTaskCompletionsRepository.create({
      household_task_id: task.id,
      completed_by_user_id: user.id,
      due_date: exceptionDate,
    })

    expect(householdTaskCompletionsRepository.items).toHaveLength(1)

    // Create exception should delete the completion
    await sut.execute({
      taskId: task.id,
      userId: user.id,
      exceptionDate,
    })

    expect(householdTaskCompletionsRepository.items).toHaveLength(0)
  })

  it('should store the exception in the repository', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const task = await householdTasksRepository.create({
      author_id: user.id,
      couple_id: 1,
      title: 'Weekly Cleaning',
      start_date: new Date('2025-01-15'),
      recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
    })

    const exceptionDate = new Date('2025-01-22')

    await sut.execute({
      taskId: task.id,
      userId: user.id,
      exceptionDate,
    })

    expect(householdTaskExceptionsRepository.items).toHaveLength(1)
    expect(householdTaskExceptionsRepository.items[0].household_task_id).toBe(
      task.id,
    )
  })

  it('should be able to create multiple exceptions for different dates', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const task = await householdTasksRepository.create({
      author_id: user.id,
      couple_id: 1,
      title: 'Weekly Cleaning',
      start_date: new Date('2025-01-15'),
      recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
    })

    const firstExceptionDate = new Date('2025-01-22')
    const secondExceptionDate = new Date('2025-01-29')

    await sut.execute({
      taskId: task.id,
      userId: user.id,
      exceptionDate: firstExceptionDate,
    })

    await sut.execute({
      taskId: task.id,
      userId: user.id,
      exceptionDate: secondExceptionDate,
    })

    expect(householdTaskExceptionsRepository.items).toHaveLength(2)
  })

  it('should set created_at timestamp', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const task = await householdTasksRepository.create({
      author_id: user.id,
      couple_id: 1,
      title: 'Weekly Cleaning',
      start_date: new Date('2025-01-15'),
      recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
    })

    const exceptionDate = new Date('2025-01-22')

    const { exception } = await sut.execute({
      taskId: task.id,
      userId: user.id,
      exceptionDate,
    })

    expect(exception.created_at).toBeInstanceOf(Date)
  })
})
