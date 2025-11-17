import { beforeEach, describe, expect, it } from 'vitest'
import { DeleteCalendarEventExceptionUseCase } from './delete-calendar-event-exception'
import { InMemoryCalendarEventExceptionsRepository } from '@/repositories/in-memory/in-memory-calendar-event-exceptions-repository'
import { InMemoryCalendarEventsRepository } from '@/repositories/in-memory/in-memory-calendar-events-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'

let calendarEventExceptionsRepository: InMemoryCalendarEventExceptionsRepository
let calendarEventsRepository: InMemoryCalendarEventsRepository
let usersRepository: InMemoryUsersRepository
let sut: DeleteCalendarEventExceptionUseCase

describe('Delete Calendar Event Exception Use Case', () => {
  beforeEach(() => {
    calendarEventsRepository = new InMemoryCalendarEventsRepository()
    calendarEventExceptionsRepository =
      new InMemoryCalendarEventExceptionsRepository()
    calendarEventExceptionsRepository.calendarEvents =
      calendarEventsRepository.items
    usersRepository = new InMemoryUsersRepository()
    sut = new DeleteCalendarEventExceptionUseCase(
      usersRepository,
      calendarEventExceptionsRepository,
    )
  })

  it('should be able to delete a calendar event exception', async () => {
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

    const exception = await calendarEventExceptionsRepository.create({
      calendar_event_id: event.id,
      created_by_user_id: user.id,
      exception_date: new Date('2025-01-22T10:00:00Z'),
    })

    expect(calendarEventExceptionsRepository.items).toHaveLength(1)

    await sut.execute({
      userId: user.id,
      exceptionId: exception.id,
    })

    expect(calendarEventExceptionsRepository.items).toHaveLength(0)
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

    const event = await calendarEventsRepository.create({
      author_id: 2,
      couple_id: 2, // Different couple
      title: 'Weekly Meeting',
      start_time: new Date('2025-01-15T10:00:00Z'),
      end_time: new Date('2025-01-15T11:00:00Z'),
      is_all_day: false,
      recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
    })

    const exception = await calendarEventExceptionsRepository.create({
      calendar_event_id: event.id,
      created_by_user_id: 2,
      exception_date: new Date('2025-01-22T10:00:00Z'),
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        exceptionId: exception.id,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })
})
