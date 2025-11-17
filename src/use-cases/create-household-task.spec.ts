import { beforeEach, describe, expect, it } from 'vitest'
import { CreateHouseholdTaskUseCase } from './create-household-task'
import { InMemoryHouseholdTasksRepository } from '@/repositories/in-memory/in-memory-household-tasks-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

let householdTasksRepository: InMemoryHouseholdTasksRepository
let usersRepository: InMemoryUsersRepository
let sut: CreateHouseholdTaskUseCase

describe('Create Household Task Use Case', () => {
  beforeEach(() => {
    householdTasksRepository = new InMemoryHouseholdTasksRepository()
    usersRepository = new InMemoryUsersRepository()
    sut = new CreateHouseholdTaskUseCase(
      householdTasksRepository,
      usersRepository,
    )
  })

  it('should be able to create a household task', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const startDate = new Date('2025-01-15')

    const { householdTask } = await sut.execute({
      authorId: user.id,
      title: 'Clean the kitchen',
      description: 'Deep clean all surfaces',
      startDate,
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO',
    })

    expect(householdTask.id).toEqual(expect.any(Number))
    expect(householdTask.title).toBe('Clean the kitchen')
    expect(householdTask.description).toBe('Deep clean all surfaces')
    expect(householdTask.author_id).toBe(user.id)
    expect(householdTask.couple_id).toBe(1)
  })

  it('should be able to create a task without description', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const startDate = new Date('2025-01-15')

    const { householdTask } = await sut.execute({
      authorId: user.id,
      title: 'Take out trash',
      startDate,
    })

    expect(householdTask.title).toBe('Take out trash')
    expect(householdTask.description).toBeNull()
  })

  it('should be able to create a task without recurrence rule', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const startDate = new Date('2025-01-15')

    const { householdTask } = await sut.execute({
      authorId: user.id,
      title: 'One-time task',
      startDate,
    })

    expect(householdTask.recurrence_rule).toBeNull()
  })

  it('should not be able to create a task if user does not exist', async () => {
    const startDate = new Date('2025-01-15')

    await expect(() =>
      sut.execute({
        authorId: 999,
        title: 'Clean the kitchen',
        startDate,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create a task if user does not have a couple', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: null,
    })

    const startDate = new Date('2025-01-15')

    await expect(() =>
      sut.execute({
        authorId: user.id,
        title: 'Clean the kitchen',
        startDate,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should store the task in the repository', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const startDate = new Date('2025-01-15')

    await sut.execute({
      authorId: user.id,
      title: 'Clean the kitchen',
      startDate,
    })

    expect(householdTasksRepository.items).toHaveLength(1)
    expect(householdTasksRepository.items[0].title).toBe('Clean the kitchen')
  })

  it('should set created_at and updated_at timestamps', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const startDate = new Date('2025-01-15')

    const { householdTask } = await sut.execute({
      authorId: user.id,
      title: 'Clean the kitchen',
      startDate,
    })

    expect(householdTask.created_at).toBeInstanceOf(Date)
    expect(householdTask.updated_at).toBeInstanceOf(Date)
  })

  it('should set deleted_at as null by default', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const startDate = new Date('2025-01-15')

    const { householdTask } = await sut.execute({
      authorId: user.id,
      title: 'Clean the kitchen',
      startDate,
    })

    expect(householdTask.deleted_at).toBeNull()
  })
})
