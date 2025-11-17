import { beforeEach, describe, expect, it } from 'vitest'
import { DeleteCalendarEventUseCase } from './delete-calendar-event'
import { InMemoryCalendarEventsRepository } from '@/repositories/in-memory/in-memory-calendar-events-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'

let calendarEventsRepository: InMemoryCalendarEventsRepository
let usersRepository: InMemoryUsersRepository
let sut: DeleteCalendarEventUseCase

describe('Delete Calendar Event Use Case', () => {
  beforeEach(() => {
    calendarEventsRepository = new InMemoryCalendarEventsRepository()
    usersRepository = new InMemoryUsersRepository()
    sut = new DeleteCalendarEventUseCase(
      calendarEventsRepository,
      usersRepository,
    )
  })

  it('should be able to delete a calendar event', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const event = await calendarEventsRepository.create({
      author_id: user.id,
      couple_id: 1,
      title: 'Dentist Appointment',
      start_time: new Date('2025-01-15T10:00:00Z'),
      end_time: new Date('2025-01-15T11:00:00Z'),
      is_all_day: false,
    })

    expect(calendarEventsRepository.items).toHaveLength(1)

    await sut.execute({
      userId: user.id,
      eventId: event.id,
    })

    expect(calendarEventsRepository.items).toHaveLength(0)
  })

  it('should not be able to delete an event if user does not exist', async () => {
    await expect(() =>
      sut.execute({
        userId: 999,
        eventId: 1,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete an event if user does not have a couple', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: null,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        eventId: 1,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete an event that does not exist', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        eventId: 999,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete an event from another couple', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const event = await calendarEventsRepository.create({
      author_id: 2,
      couple_id: 2, // Different couple
      title: 'Dentist Appointment',
      start_time: new Date('2025-01-15T10:00:00Z'),
      end_time: new Date('2025-01-15T11:00:00Z'),
      is_all_day: false,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        eventId: event.id,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })
})
