import {
  CalendarEventsRepository,
  CalendarEventWithDetails,
} from '@repositories/calendar-events-repository'
import { UsersRepository } from '@repositories/users-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { RRule, RRuleSet } from 'rrule'
import { CalendarEventExceptionsRepository } from '@/repositories/calendar-event-exceptions-repository'

// [NOVO] Define a "ocorrência" de um evento
export type CalendarEventOccurrence = CalendarEventWithDetails & {
  // As datas específicas desta ocorrência
  occurrence_start_time: Date
  occurrence_end_time: Date
}

interface FetchCalendarEventsUseCaseRequest {
  userId: number
  startDate: Date // Início da janela de busca
  endDate: Date // Fim da janela de busca (ex: 50 anos no futuro)
}

interface FetchCalendarEventsUseCaseResponse {
  events: CalendarEventOccurrence[]
}

export class FetchCalendarEventsUseCase {
  constructor(
    private calendarEventsRepository: CalendarEventsRepository,
    private usersRepository: UsersRepository,
    private calendarEventExceptionsRepository: CalendarEventExceptionsRepository,
  ) {}

  async execute({
    userId,
    startDate,
    endDate,
  }: FetchCalendarEventsUseCaseRequest): Promise<FetchCalendarEventsUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user || !user.couple_id) {
      throw new ResourceNotFoundError()
    }

    // 1. Busca todas as "definições" de eventos do casal
    const allEventDefinitions =
      await this.calendarEventsRepository.findManyByCoupleId(user.couple_id)

    const exceptions =
      await this.calendarEventExceptionsRepository.findManyByCoupleIdAndDateRange(
        user.couple_id,
        startDate,
        endDate,
      )

    const exceptionSet = new Set(
      exceptions.map(
        (ex) => `${ex.calendar_event_id}_${ex.exception_date.getTime()}`,
      ),
    )

    const occurrences: CalendarEventOccurrence[] = []

    for (const event of allEventDefinitions) {
      // 2. Calcula a duração do evento
      const duration = event.end_time.getTime() - event.start_time.getTime()

      // 3. Trata eventos recorrentes
      if (event.recurrence_rule) {
        //
        const rruleSet = new RRuleSet()

        // Define a regra principal de recorrência
        const rule = RRule.fromString(
          `DTSTART:${event.start_time
            .toISOString()
            .replace(/\.\d{3}Z$/, 'Z')}\n${event.recurrence_rule}`,
        )
        rruleSet.rrule(rule)

        // (No futuro, poderíamos adicionar EXDATEs aqui se tivéssemos exceções)

        // 4. Gera as ocorrências dentro da janela de busca
        const occurrenceDates = rruleSet.between(startDate, endDate)

        for (const date of occurrenceDates) {
          // Ajusta a data para UTC para evitar problemas de fuso
          const utcDate = new Date(
            Date.UTC(
              date.getUTCFullYear(),
              date.getUTCMonth(),
              date.getUTCDate(),
              date.getUTCHours(),
              date.getUTCMinutes(),
            ),
          )

          const exceptionKey = `${event.id}_${utcDate.getTime()}`
          if (exceptionSet.has(exceptionKey)) {
            continue // Pula esta ocorrência (foi cancelada)
          }

          occurrences.push({
            ...event,
            occurrence_start_time: utcDate,
            occurrence_end_time: new Date(utcDate.getTime() + duration),
          })
        }
      } else {
        // 5. Trata eventos únicos (não recorrentes)
        // Verifica se o evento único cai dentro da janela
        const exceptionKey = `${event.id}_${event.start_time.getTime()}`
        if (
          event.start_time >= startDate &&
          event.start_time <= endDate &&
          !exceptionSet.has(exceptionKey)
        ) {
          occurrences.push({
            ...event,
            occurrence_start_time: event.start_time,
            occurrence_end_time: event.end_time,
          })
        }
      }
    }

    return {
      events: occurrences,
    }
  }
}
