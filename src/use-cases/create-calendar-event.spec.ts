import { beforeEach, describe, expect, it } from 'vitest'
import { CreateCalendarEventUseCase } from './create-calendar-event'
import { InMemoryCalendarEventsRepository } from '@/repositories/in-memory/in-memory-calendar-events-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

let calendarEventsRepository: InMemoryCalendarEventsRepository
let usersRepository: InMemoryUsersRepository
let sut: CreateCalendarEventUseCase

describe('Create Calendar Event Use Case', () => {
  beforeEach(() => {
    calendarEventsRepository = new InMemoryCalendarEventsRepository()
    usersRepository = new InMemoryUsersRepository()
    sut = new CreateCalendarEventUseCase(
      calendarEventsRepository,
      usersRepository,
    )
  })

  it('should be able to create a calendar event', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const startTime = new Date('2025-01-15T10:00:00Z')
    const endTime = new Date('2025-01-15T11:00:00Z')

    const { calendarEvent } = await sut.execute({
      authorId: user.id,
      title: 'Dentist Appointment',
      description: 'Annual checkup',
      startTime,
      endTime,
      isAllDay: false,
      recurrenceRule: null,
      categoryId: 1,
    })

    expect(calendarEvent.id).toEqual(expect.any(Number))
    expect(calendarEvent.title).toBe('Dentist Appointment')
    expect(calendarEvent.description).toBe('Annual checkup')
    expect(calendarEvent.author_id).toBe(user.id)
    expect(calendarEvent.couple_id).toBe(1)
    expect(calendarEvent.is_all_day).toBe(false)
    expect(calendarEvent.category_id).toBe(1)
  })

  it('should be able to create an all-day event', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const startTime = new Date('2025-01-15T00:00:00Z')
    const endTime = new Date('2025-01-15T23:59:59Z')

    const { calendarEvent } = await sut.execute({
      authorId: user.id,
      title: 'Birthday',
      startTime,
      endTime,
      isAllDay: true,
    })

    expect(calendarEvent.is_all_day).toBe(true)
  })

  it('should be able to create an event without description', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const startTime = new Date('2025-01-15T10:00:00Z')
    const endTime = new Date('2025-01-15T11:00:00Z')

    const { calendarEvent } = await sut.execute({
      authorId: user.id,
      title: 'Meeting',
      startTime,
      endTime,
      isAllDay: false,
    })

    expect(calendarEvent.description).toBeNull()
  })

  it('should be able to create an event with recurrence rule', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const startTime = new Date('2025-01-15T10:00:00Z')
    const endTime = new Date('2025-01-15T11:00:00Z')

    const { calendarEvent } = await sut.execute({
      authorId: user.id,
      title: 'Weekly Meeting',
      startTime,
      endTime,
      isAllDay: false,
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO',
    })

    expect(calendarEvent.recurrence_rule).toBe('FREQ=WEEKLY;BYDAY=MO')
  })

  it('should be able to create an event without category', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const startTime = new Date('2025-01-15T10:00:00Z')
    const endTime = new Date('2025-01-15T11:00:00Z')

    const { calendarEvent } = await sut.execute({
      authorId: user.id,
      title: 'Uncategorized Event',
      startTime,
      endTime,
      isAllDay: false,
    })

    expect(calendarEvent.category_id).toBeNull()
  })

  it('should not be able to create an event if user does not exist', async () => {
    const startTime = new Date('2025-01-15T10:00:00Z')
    const endTime = new Date('2025-01-15T11:00:00Z')

    await expect(() =>
      sut.execute({
        authorId: 999,
        title: 'Event',
        startTime,
        endTime,
        isAllDay: false,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create an event if user does not have a couple', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: null,
    })

    const startTime = new Date('2025-01-15T10:00:00Z')
    const endTime = new Date('2025-01-15T11:00:00Z')

    await expect(() =>
      sut.execute({
        authorId: user.id,
        title: 'Event',
        startTime,
        endTime,
        isAllDay: false,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should store the event in the repository', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const startTime = new Date('2025-01-15T10:00:00Z')
    const endTime = new Date('2025-01-15T11:00:00Z')

    await sut.execute({
      authorId: user.id,
      title: 'Event',
      startTime,
      endTime,
      isAllDay: false,
    })

    expect(calendarEventsRepository.items).toHaveLength(1)
    expect(calendarEventsRepository.items[0].title).toBe('Event')
  })

  it('should set created_at and updated_at timestamps', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const startTime = new Date('2025-01-15T10:00:00Z')
    const endTime = new Date('2025-01-15T11:00:00Z')

    const { calendarEvent } = await sut.execute({
      authorId: user.id,
      title: 'Event',
      startTime,
      endTime,
      isAllDay: false,
    })

    expect(calendarEvent.created_at).toBeInstanceOf(Date)
    expect(calendarEvent.updated_at).toBeInstanceOf(Date)
  })
})
