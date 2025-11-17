import { beforeEach, describe, expect, it } from 'vitest'
import { CreateCalendarEventExceptionUseCase } from './create-calendar-event-exception'
import { InMemoryCalendarEventExceptionsRepository } from '@/repositories/in-memory/in-memory-calendar-event-exceptions-repository'
import { InMemoryCalendarEventsRepository } from '@/repositories/in-memory/in-memory-calendar-events-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'
import { CalendarExceptionAlreadyExistsError } from './errors/calendar-exception-already-exists-error'

let calendarEventExceptionsRepository: InMemoryCalendarEventExceptionsRepository
let calendarEventsRepository: InMemoryCalendarEventsRepository
let usersRepository: InMemoryUsersRepository
let sut: CreateCalendarEventExceptionUseCase

describe('Create Calendar Event Exception Use Case', () => {
  beforeEach(() => {
    calendarEventExceptionsRepository =
      new InMemoryCalendarEventExceptionsRepository()
    calendarEventsRepository = new InMemoryCalendarEventsRepository()
    usersRepository = new InMemoryUsersRepository()
    sut = new CreateCalendarEventExceptionUseCase(
      usersRepository,
      calendarEventsRepository,
      calendarEventExceptionsRepository,
    )
  })

  it('should be able to create a calendar event exception', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const event = await calendarEventsRepository.create({
      author_id: user.id,
      couple_id: 1,
      title: 'Weekly Meeting',
      start_time: new Date('2025-01-15T10:00:00Z'),
      end_time: new Date('2025-01-15T11:00:00Z'),
      is_all_day: false,
      recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
    })

    const exceptionDate = new Date('2025-01-22T10:00:00Z')

    const exception = await sut.execute({
      userId: user.id,
      eventId: event.id,
      exceptionDate,
    })

    expect(exception.id).toEqual(expect.any(Number))
    expect(exception.calendar_event_id).toBe(event.id)
    expect(exception.created_by_user_id).toBe(user.id)
    expect(exception.exception_date).toEqual(exceptionDate)
  })

  it('should not be able to create an exception if user does not exist', async () => {
    const exceptionDate = new Date('2025-01-22T10:00:00Z')

    await expect(() =>
      sut.execute({
        userId: 999,
        eventId: 1,
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

    const exceptionDate = new Date('2025-01-22T10:00:00Z')

    await expect(() =>
      sut.execute({
        userId: user.id,
        eventId: 1,
        exceptionDate,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create an exception if event does not exist', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const exceptionDate = new Date('2025-01-22T10:00:00Z')

    await expect(() =>
      sut.execute({
        userId: user.id,
        eventId: 999,
        exceptionDate,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create an exception if event belongs to another couple', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const event = await calendarEventsRepository.create({
      author_id: user.id,
      couple_id: 2, // Different couple
      title: 'Weekly Meeting',
      start_time: new Date('2025-01-15T10:00:00Z'),
      end_time: new Date('2025-01-15T11:00:00Z'),
      is_all_day: false,
    })

    const exceptionDate = new Date('2025-01-22T10:00:00Z')

    await expect(() =>
      sut.execute({
        userId: user.id,
        eventId: event.id,
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

    const event = await calendarEventsRepository.create({
      author_id: user.id,
      couple_id: 1,
      title: 'Weekly Meeting',
      start_time: new Date('2025-01-15T10:00:00Z'),
      end_time: new Date('2025-01-15T11:00:00Z'),
      is_all_day: false,
      recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
    })

    const exceptionDate = new Date('2025-01-22T10:00:00Z')

    await sut.execute({
      userId: user.id,
      eventId: event.id,
      exceptionDate,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        eventId: event.id,
        exceptionDate,
      }),
    ).rejects.toBeInstanceOf(CalendarExceptionAlreadyExistsError)
  })

  it('should store the exception in the repository', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const event = await calendarEventsRepository.create({
      author_id: user.id,
      couple_id: 1,
      title: 'Weekly Meeting',
      start_time: new Date('2025-01-15T10:00:00Z'),
      end_time: new Date('2025-01-15T11:00:00Z'),
      is_all_day: false,
      recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
    })

    const exceptionDate = new Date('2025-01-22T10:00:00Z')

    await sut.execute({
      userId: user.id,
      eventId: event.id,
      exceptionDate,
    })

    expect(calendarEventExceptionsRepository.items).toHaveLength(1)
    expect(calendarEventExceptionsRepository.items[0].calendar_event_id).toBe(
      event.id,
    )
  })

  it('should be able to create multiple exceptions for different dates', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const event = await calendarEventsRepository.create({
      author_id: user.id,
      couple_id: 1,
      title: 'Weekly Meeting',
      start_time: new Date('2025-01-15T10:00:00Z'),
      end_time: new Date('2025-01-15T11:00:00Z'),
      is_all_day: false,
      recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
    })

    const firstExceptionDate = new Date('2025-01-22T10:00:00Z')
    const secondExceptionDate = new Date('2025-01-29T10:00:00Z')

    await sut.execute({
      userId: user.id,
      eventId: event.id,
      exceptionDate: firstExceptionDate,
    })

    await sut.execute({
      userId: user.id,
      eventId: event.id,
      exceptionDate: secondExceptionDate,
    })

    expect(calendarEventExceptionsRepository.items).toHaveLength(2)
  })

  it('should set created_at timestamp', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const event = await calendarEventsRepository.create({
      author_id: user.id,
      couple_id: 1,
      title: 'Weekly Meeting',
      start_time: new Date('2025-01-15T10:00:00Z'),
      end_time: new Date('2025-01-15T11:00:00Z'),
      is_all_day: false,
      recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
    })

    const exceptionDate = new Date('2025-01-22T10:00:00Z')

    const exception = await sut.execute({
      userId: user.id,
      eventId: event.id,
      exceptionDate,
    })

    expect(exception.created_at).toBeInstanceOf(Date)
  })
})
