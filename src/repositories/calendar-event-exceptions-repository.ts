import { CalendarEvent, CalendarEventException, Prisma } from '@prisma/client'

// Tipo para buscar a exceção E sua tarefa pai (para auth)
export type CalendarEventExceptionWithEvent = CalendarEventException & {
  calendar_event: CalendarEvent
}

export interface CalendarEventExceptionsRepository {
  create(
    data: Prisma.CalendarEventExceptionUncheckedCreateInput,
  ): Promise<CalendarEventException>

  findByEventIdAndDate(
    eventId: number,
    exceptionDate: Date,
  ): Promise<CalendarEventException | null>

  findManyByCoupleIdAndDateRange(
    coupleId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<CalendarEventException[]>

  findById(id: number): Promise<CalendarEventExceptionWithEvent | null>

  deleteById(id: number): Promise<void>
}
