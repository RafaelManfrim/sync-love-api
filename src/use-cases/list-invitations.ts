import { UsersRepository } from '@/repositories/users-repository'
import { CoupleInvitesRepository } from '@/repositories/couple-invites-repository'
import { CoupleInvite } from '@prisma/client'
import { UserNotFoundError } from './errors/user-not-found-error'

interface ListInvitationsUseCaseRequest {
  userId: number
}

interface ListInvitationsUseCaseResponse {
  recievedInvites: CoupleInvite[]
  sentInvites?: CoupleInvite[]
}

export class ListInvitationsUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private coupleInvitesRepository: CoupleInvitesRepository,
  ) {}

  async execute({
    userId,
  }: ListInvitationsUseCaseRequest): Promise<ListInvitationsUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new UserNotFoundError()
    }

    const recievedInvites =
      await this.coupleInvitesRepository.listByInviteeEmail(user.email)

    const sentInvites = await this.coupleInvitesRepository.listByUserId(user.id)

    return { recievedInvites, sentInvites }
  }
}
