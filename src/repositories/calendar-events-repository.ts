import {
  CalendarEvent,
  CalendarEventCategory,
  Prisma,
  User,
} from '@prisma/client'

export type CalendarEventWithDetails = CalendarEvent & {
  author: User
  category: CalendarEventCategory | null
}

export interface CalendarEventsRepository {
  create(data: Prisma.CalendarEventUncheckedCreateInput): Promise<CalendarEvent>
  findManyByCoupleId(coupleId: number): Promise<CalendarEventWithDetails[]>
  findById(id: number): Promise<CalendarEvent | null>
  update(
    id: number,
    data: Prisma.CalendarEventUncheckedUpdateInput,
  ): Promise<CalendarEvent>
  deleteById(id: number): Promise<void>
  countByCoupleId(coupleId: number): Promise<number>
}
