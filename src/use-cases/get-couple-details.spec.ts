import { beforeEach, describe, expect, it } from 'vitest'
import { GetCoupleDetailsUseCase } from './get-couple-details'
import { InMemoryCouplesRepository } from '@/repositories/in-memory/in-memory-couples-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { InMemoryHouseholdTasksRepository } from '@/repositories/in-memory/in-memory-household-tasks-repository'
import { InMemoryHouseholdTaskCompletionsRepository } from '@/repositories/in-memory/in-memory-household-task-completions-repository'
import { InMemoryCalendarEventsRepository } from '@/repositories/in-memory/in-memory-calendar-events-repository'
import { hash } from 'bcryptjs'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

let couplesRepository: InMemoryCouplesRepository
let usersRepository: InMemoryUsersRepository
let householdTasksRepository: InMemoryHouseholdTasksRepository
let householdTaskCompletionsRepository: InMemoryHouseholdTaskCompletionsRepository
let calendarEventsRepository: InMemoryCalendarEventsRepository
let sut: GetCoupleDetailsUseCase

describe('Get Couple Details Use Case', () => {
  beforeEach(() => {
    couplesRepository = new InMemoryCouplesRepository()
    usersRepository = new InMemoryUsersRepository()
    householdTasksRepository = new InMemoryHouseholdTasksRepository()
    householdTaskCompletionsRepository =
      new InMemoryHouseholdTaskCompletionsRepository()
    householdTaskCompletionsRepository.tasks = householdTasksRepository.items
    calendarEventsRepository = new InMemoryCalendarEventsRepository()
    sut = new GetCoupleDetailsUseCase(
      couplesRepository,
      usersRepository,
      householdTasksRepository,
      householdTaskCompletionsRepository,
      calendarEventsRepository,
    )
  })

  it('should be able to get couple details', async () => {
    const user1 = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const user2 = await usersRepository.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const couple = await couplesRepository.create({
      invite_id: 1,
      inviter_id: user1.id,
      invitee_id: user2.id,
    })

    const details = await sut.execute({
      userId: user1.id,
    })

    expect(details.partner.id).toBe(user2.id)
    expect(details.partner.name).toBe('Jane Doe')
    expect(details.partner.email).toBe('jane@example.com')
    expect(details.togetherSince).toEqual(couple.created_at)
  })

  it('should not be able to get couple details if user does not exist', async () => {
    await expect(() =>
      sut.execute({
        userId: 999,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to get couple details if user does not have a couple', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: null,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return task completion summary', async () => {
    const user1 = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const user2 = await usersRepository.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    await couplesRepository.create({
      invite_id: 1,
      inviter_id: user1.id,
      invitee_id: user2.id,
    })

    const task = await householdTasksRepository.create({
      author_id: user1.id,
      couple_id: 1,
      title: 'Clean the kitchen',
      start_date: new Date('2025-01-15'),
    })

    await householdTaskCompletionsRepository.create({
      household_task_id: task.id,
      completed_by_user_id: user1.id,
      task_due_date: new Date('2025-01-15'),
    })

    await householdTaskCompletionsRepository.create({
      household_task_id: task.id,
      completed_by_user_id: user2.id,
      task_due_date: new Date('2025-01-16'),
    })

    const details = await sut.execute({
      userId: user1.id,
    })

    expect(details.taskCompletionSummary.me).toBe(1)
    expect(details.taskCompletionSummary.partner).toBe(1)
  })

  it('should return total tasks and events created', async () => {
    const user1 = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const user2 = await usersRepository.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    await couplesRepository.create({
      invite_id: 1,
      inviter_id: user1.id,
      invitee_id: user2.id,
    })

    await householdTasksRepository.create({
      author_id: user1.id,
      couple_id: 1,
      title: 'Task 1',
      start_date: new Date('2025-01-15'),
    })

    await householdTasksRepository.create({
      author_id: user1.id,
      couple_id: 1,
      title: 'Task 2',
      start_date: new Date('2025-01-16'),
    })

    await calendarEventsRepository.create({
      author_id: user1.id,
      couple_id: 1,
      title: 'Event 1',
      start_time: new Date('2025-01-15T10:00:00Z'),
      end_time: new Date('2025-01-15T11:00:00Z'),
      is_all_day: false,
    })

    const details = await sut.execute({
      userId: user1.id,
    })

    expect(details.totalTasksCreated).toBe(2)
    expect(details.totalCalendarEventsCreated).toBe(1)
  })
})
