import { beforeEach, describe, expect, it } from 'vitest'
import { DeleteHouseholdTaskCompletionUseCase } from './delete-household-task-completion'
import { InMemoryHouseholdTaskCompletionsRepository } from '@/repositories/in-memory/in-memory-household-task-completions-repository'
import { InMemoryHouseholdTasksRepository } from '@/repositories/in-memory/in-memory-household-tasks-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'

let householdTaskCompletionsRepository: InMemoryHouseholdTaskCompletionsRepository
let householdTasksRepository: InMemoryHouseholdTasksRepository
let usersRepository: InMemoryUsersRepository
let sut: DeleteHouseholdTaskCompletionUseCase

describe('Delete Household Task Completion Use Case', () => {
  beforeEach(() => {
    householdTasksRepository = new InMemoryHouseholdTasksRepository()
    householdTaskCompletionsRepository =
      new InMemoryHouseholdTaskCompletionsRepository()
    householdTaskCompletionsRepository.tasks = householdTasksRepository.items
    usersRepository = new InMemoryUsersRepository()
    sut = new DeleteHouseholdTaskCompletionUseCase(
      householdTaskCompletionsRepository,
      usersRepository,
    )
  })

  it('should be able to delete a household task completion', async () => {
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

    const completion = await householdTaskCompletionsRepository.create({
      household_task_id: task.id,
      completed_by_user_id: user.id,
      task_due_date: new Date('2025-01-15'),
    })

    expect(householdTaskCompletionsRepository.items).toHaveLength(1)

    await sut.execute({
      userId: user.id,
      completionId: completion.id,
    })

    expect(householdTaskCompletionsRepository.items).toHaveLength(0)
  })

  it('should not be able to delete a completion if user does not exist', async () => {
    await expect(() =>
      sut.execute({
        userId: 999,
        completionId: 1,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete a completion if user does not have a couple', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: null,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        completionId: 1,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete a completion that does not exist', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        completionId: 999,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete a completion from another couple', async () => {
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

    const completion = await householdTaskCompletionsRepository.create({
      household_task_id: task.id,
      completed_by_user_id: 2,
      task_due_date: new Date('2025-01-15'),
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        completionId: completion.id,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })
})
