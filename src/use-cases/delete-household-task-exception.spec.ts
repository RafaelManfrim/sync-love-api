import { beforeEach, describe, expect, it } from 'vitest'
import { DeleteHouseholdTaskExceptionUseCase } from './delete-household-task-exception'
import { InMemoryHouseholdTaskExceptionsRepository } from '@/repositories/in-memory/in-memory-household-task-exceptions-repository'
import { InMemoryHouseholdTasksRepository } from '@/repositories/in-memory/in-memory-household-tasks-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'

let householdTaskExceptionsRepository: InMemoryHouseholdTaskExceptionsRepository
let householdTasksRepository: InMemoryHouseholdTasksRepository
let usersRepository: InMemoryUsersRepository
let sut: DeleteHouseholdTaskExceptionUseCase

describe('Delete Household Task Exception Use Case', () => {
  beforeEach(() => {
    householdTasksRepository = new InMemoryHouseholdTasksRepository()
    householdTaskExceptionsRepository =
      new InMemoryHouseholdTaskExceptionsRepository()
    householdTaskExceptionsRepository.tasks = householdTasksRepository.items
    usersRepository = new InMemoryUsersRepository()
    sut = new DeleteHouseholdTaskExceptionUseCase(
      householdTaskExceptionsRepository,
      usersRepository,
    )
  })

  it('should be able to delete a household task exception', async () => {
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

    const exception = await householdTaskExceptionsRepository.create({
      household_task_id: task.id,
      created_by_user_id: user.id,
      exception_date: new Date('2025-01-22'),
    })

    expect(householdTaskExceptionsRepository.items).toHaveLength(1)

    await sut.execute({
      userId: user.id,
      exceptionId: exception.id,
    })

    expect(householdTaskExceptionsRepository.items).toHaveLength(0)
  })

  it('should not be able to delete an exception if user does not exist', async () => {
    await expect(() =>
      sut.execute({
        userId: 999,
        exceptionId: 1,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete an exception if user does not have a couple', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: null,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        exceptionId: 1,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete an exception that does not exist', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        exceptionId: 999,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete an exception from another couple', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const task = await householdTasksRepository.create({
      author_id: 2,
      couple_id: 2, // Different couple
      title: 'Weekly Cleaning',
      start_date: new Date('2025-01-15'),
      recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
    })

    const exception = await householdTaskExceptionsRepository.create({
      household_task_id: task.id,
      created_by_user_id: 2,
      exception_date: new Date('2025-01-22'),
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        exceptionId: exception.id,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })
})
