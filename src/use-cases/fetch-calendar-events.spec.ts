import { beforeEach, describe, expect, it } from 'vitest'
import { FetchCalendarEventsUseCase } from './fetch-calendar-events'
import { InMemoryCalendarEventsRepository } from '@/repositories/in-memory/in-memory-calendar-events-repository'
import { InMemoryCalendarEventExceptionsRepository } from '@/repositories/in-memory/in-memory-calendar-event-exceptions-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

let calendarEventsRepository: InMemoryCalendarEventsRepository
let calendarEventExceptionsRepository: InMemoryCalendarEventExceptionsRepository
let usersRepository: InMemoryUsersRepository
let sut: FetchCalendarEventsUseCase

describe('Fetch Calendar Events Use Case', () => {
  beforeEach(() => {
    calendarEventsRepository = new InMemoryCalendarEventsRepository()
    calendarEventExceptionsRepository =
      new InMemoryCalendarEventExceptionsRepository()
    calendarEventExceptionsRepository.calendarEvents =
      calendarEventsRepository.items
    usersRepository = new InMemoryUsersRepository()
    calendarEventsRepository.users = usersRepository.items
    sut = new FetchCalendarEventsUseCase(
      calendarEventsRepository,
      usersRepository,
      calendarEventExceptionsRepository,
    )
  })

  it('should be able to fetch calendar events for a couple', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    await calendarEventsRepository.create({
      author_id: user.id,
      couple_id: 1,
      title: 'Dentist Appointment',
      start_time: new Date('2025-01-15T10:00:00Z'),
      end_time: new Date('2025-01-15T11:00:00Z'),
      is_all_day: false,
    })

    const startDate = new Date('2025-01-01')
    const endDate = new Date('2025-12-31')

    const { events } = await sut.execute({
      userId: user.id,
      startDate,
      endDate,
    })

    expect(events.length).toBeGreaterThan(0)
    expect(events[0].title).toBe('Dentist Appointment')
    expect(events[0]).toHaveProperty('occurrence_start_time')
    expect(events[0]).toHaveProperty('occurrence_end_time')
  })

  it('should not be able to fetch events if user does not exist', async () => {
    const startDate = new Date('2025-01-01')
    const endDate = new Date('2025-12-31')

    await expect(() =>
      sut.execute({
        userId: 999,
        startDate,
        endDate,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to fetch events if user does not have a couple', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: null,
    })

    const startDate = new Date('2025-01-01')
    const endDate = new Date('2025-12-31')

    await expect(() =>
      sut.execute({
        userId: user.id,
        startDate,
        endDate,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return empty array if couple has no events', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const startDate = new Date('2025-01-01')
    const endDate = new Date('2025-12-31')

    const { events } = await sut.execute({
      userId: user.id,
      startDate,
      endDate,
    })

    expect(events).toHaveLength(0)
    expect(events).toEqual([])
  })

  it('should not return events from other couples', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    await calendarEventsRepository.create({
      author_id: user.id,
      couple_id: 1,
      title: 'My Event',
      start_time: new Date('2025-01-15T10:00:00Z'),
      end_time: new Date('2025-01-15T11:00:00Z'),
      is_all_day: false,
    })

    await calendarEventsRepository.create({
      author_id: 2,
      couple_id: 2,
      title: 'Other Couple Event',
      start_time: new Date('2025-01-16T10:00:00Z'),
      end_time: new Date('2025-01-16T11:00:00Z'),
      is_all_day: false,
    })

    const startDate = new Date('2025-01-01')
    const endDate = new Date('2025-12-31')

    const { events } = await sut.execute({
      userId: user.id,
      startDate,
      endDate,
    })

    expect(events.every((event) => event.title !== 'Other Couple Event')).toBe(
      true,
    )
  })
})
