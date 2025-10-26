import { prisma } from '@lib/prisma'
import { CalendarEventException, Prisma } from '@prisma/client'
import {
  CalendarEventExceptionsRepository,
  CalendarEventExceptionWithEvent,
} from '../calendar-event-exceptions-repository'

export class PrismaCalendarEventExceptionsRepository
  implements CalendarEventExceptionsRepository
{
  async create(
    data: Prisma.CalendarEventExceptionUncheckedCreateInput,
  ): Promise<CalendarEventException> {
    const exception = await prisma.calendarEventException.create({
      data,
    })
    return exception
  }

  async findByEventIdAndDate(
    eventId: number,
    exceptionDate: Date,
  ): Promise<CalendarEventException | null> {
    const exception = await prisma.calendarEventException.findUnique({
      where: {
        calendar_event_id_exception_date: {
          calendar_event_id: eventId,
          exception_date: exceptionDate,
        },
      },
    })
    return exception
  }

  async findManyByCoupleIdAndDateRange(
    coupleId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<CalendarEventException[]> {
    const exceptions = await prisma.calendarEventException.findMany({
      where: {
        exception_date: {
          gte: startDate,
          lte: endDate,
        },
        calendar_event: {
          couple_id: coupleId,
        },
      },
    })
    return exceptions
  }

  async findById(id: number): Promise<CalendarEventExceptionWithEvent | null> {
    const exception = await prisma.calendarEventException.findUnique({
      where: { id },
      include: {
        calendar_event: true,
      },
    })
    return exception
  }

  async deleteById(id: number): Promise<void> {
    await prisma.calendarEventException.delete({
      where: { id },
    })
  }
}
