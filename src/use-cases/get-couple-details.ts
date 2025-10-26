import { CouplesRepository } from '@/repositories/couples-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { HouseholdTasksRepository } from '@/repositories/household-tasks-repository'
import { HouseholdTaskCompletionsRepository } from '@/repositories/household-task-completions-repository'
import { CalendarEventsRepository } from '@/repositories/calendar-events-repository'
import { UsersRepository } from '@/repositories/users-repository'

interface GetCoupleDetailsUseCaseRequest {
  userId: number
}

interface GetCoupleDetailsUseCaseResponse {
  partner: {
    id: number
    name: string
    email: string
    avatar_url: string | null
    created_at: Date
  }
  togetherSince: Date
  listsCreated: number
  totalTasksCreated: number
  taskCompletionSummary: {
    me: number
    partner: number
  }
  totalCalendarEventsCreated: number
}

export class GetCoupleDetailsUseCase {
  constructor(
    private couplesRepository: CouplesRepository,
    private usersRepository: UsersRepository,
    private householdTasksRepository: HouseholdTasksRepository,
    private householdTaskCompletionsRepository: HouseholdTaskCompletionsRepository,
    private calendarEventsRepository: CalendarEventsRepository,
  ) {}

  async execute({
    userId,
  }: GetCoupleDetailsUseCaseRequest): Promise<GetCoupleDetailsUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user || !user.couple_id) {
      throw new ResourceNotFoundError()
    }

    const coupleId = user.couple_id

    const coupleDetails = await this.couplesRepository.findDetailsById(coupleId)

    if (!coupleDetails) {
      throw new ResourceNotFoundError()
    }

    const partner = await this.usersRepository.findById(
      user.id === coupleDetails.inviter_id
        ? coupleDetails.invitee_id
        : coupleDetails.inviter_id,
    )

    if (!partner) {
      throw new ResourceNotFoundError()
    }

    const totalTasksCreated =
      await this.householdTasksRepository.countByCoupleId(coupleId)

    const totalCalendarEventsCreated =
      await this.calendarEventsRepository.countByCoupleId(coupleId)

    const rawCompletionSummary =
      await this.householdTaskCompletionsRepository.countByCoupleIdGroupedByUser(
        coupleId,
      )

    const taskCompletionSummary = {
      me:
        rawCompletionSummary.find(
          (item) => item.completed_by_user_id === user.id,
        )?._count ?? 0,
      partner:
        rawCompletionSummary.find(
          (item) => item.completed_by_user_id === partner.id,
        )?._count ?? 0,
    }

    return {
      togetherSince: coupleDetails.created_at,
      listsCreated: coupleDetails._count.ShoppingLists,

      partner: {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        avatar_url: partner.avatar_url,
        created_at: partner.created_at,
      },
      totalTasksCreated,
      taskCompletionSummary,
      totalCalendarEventsCreated,
    }
  }
}
