import { prisma } from '@lib/prisma'
import { CalendarEvent, Prisma } from '@prisma/client'
import {
  CalendarEventsRepository,
  CalendarEventWithDetails,
} from '../calendar-events-repository'

export class PrismaCalendarEventsRepository
  implements CalendarEventsRepository
{
  async create(
    data: Prisma.CalendarEventUncheckedCreateInput,
  ): Promise<CalendarEvent> {
    const calendarEvent = await prisma.calendarEvent.create({
      data,
    })

    return calendarEvent
  }

  async findManyByCoupleId(
    coupleId: number,
  ): Promise<CalendarEventWithDetails[]> {
    const events = await prisma.calendarEvent.findMany({
      where: {
        couple_id: coupleId,
      },
      include: {
        author: true,
        category: true, //
      },
    })

    return events
  }

  async findById(id: number): Promise<CalendarEvent | null> {
    const event = await prisma.calendarEvent.findUnique({
      where: { id },
    })
    return event
  }

  async update(
    id: number,
    data: Prisma.CalendarEventUncheckedUpdateInput,
  ): Promise<CalendarEvent> {
    const event = await prisma.calendarEvent.update({
      where: { id },
      data,
    })
    return event
  }

  async deleteById(id: number): Promise<void> {
    await prisma.calendarEvent.delete({
      where: { id },
    })
  }
}
