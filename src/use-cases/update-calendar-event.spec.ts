import { beforeEach, describe, expect, it } from 'vitest'
import { UpdateCalendarEventUseCase } from './update-calendar-event'
import { InMemoryCalendarEventsRepository } from '@/repositories/in-memory/in-memory-calendar-events-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'

let calendarEventsRepository: InMemoryCalendarEventsRepository
let usersRepository: InMemoryUsersRepository
let sut: UpdateCalendarEventUseCase

describe('Update Calendar Event Use Case', () => {
  beforeEach(() => {
    calendarEventsRepository = new InMemoryCalendarEventsRepository()
    usersRepository = new InMemoryUsersRepository()
    calendarEventsRepository.users = usersRepository.items
    sut = new UpdateCalendarEventUseCase(
      calendarEventsRepository,
      usersRepository,
    )
  })

  it('should be able to update a calendar event', async () => {
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

    const { calendarEvent } = await sut.execute({
      userId: user.id,
      eventId: event.id,
      data: {
        title: 'Doctor Appointment',
        description: 'Annual checkup',
      },
    })

    expect(calendarEvent.title).toBe('Doctor Appointment')
    expect(calendarEvent.description).toBe('Annual checkup')
  })

  it('should not be able to update an event if user does not exist', async () => {
    await expect(() =>
      sut.execute({
        userId: 999,
        eventId: 1,
        data: { title: 'New title' },
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update an event if user does not have a couple', async () => {
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
        data: { title: 'New title' },
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update an event that does not exist', async () => {
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
        data: { title: 'New title' },
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update an event from another couple', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const event = await calendarEventsRepository.create({
      author_id: 2,
      couple_id: 2,
      title: 'Dentist Appointment',
      start_time: new Date('2025-01-15T10:00:00Z'),
      end_time: new Date('2025-01-15T11:00:00Z'),
      is_all_day: false,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        eventId: event.id,
        data: { title: 'New title' },
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('should be able to update event times', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const event = await calendarEventsRepository.create({
      author_id: user.id,
      couple_id: 1,
      title: 'Meeting',
      start_time: new Date('2025-01-15T10:00:00Z'),
      end_time: new Date('2025-01-15T11:00:00Z'),
      is_all_day: false,
    })

    const newStartTime = new Date('2025-01-15T14:00:00Z')
    const newEndTime = new Date('2025-01-15T15:00:00Z')

    const { calendarEvent } = await sut.execute({
      userId: user.id,
      eventId: event.id,
      data: {
        start_time: newStartTime,
        end_time: newEndTime,
      },
    })

    expect(calendarEvent.start_time).toEqual(newStartTime)
    expect(calendarEvent.end_time).toEqual(newEndTime)
  })
})
