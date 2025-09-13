import { UsersRepository } from '@/repositories/users-repository'
import { CoupleInvitesRepository } from '@/repositories/couple-invites-repository'
import { InviterNotFoundError } from './errors/inviter-not-found-error'
import { CoupleInvite } from '@prisma/client'
import { InvitationAlreadyExistsError } from './errors/invitation-already-exists-error'

interface CreateInvitationUseCaseRequest {
  inviterId: number
  email: string
}

interface CreateInvitationUseCaseResponse {
  invite: CoupleInvite
}

export class CreateInvitationUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private coupleInvitesRepository: CoupleInvitesRepository,
  ) {}

  async execute({
    inviterId,
    email,
  }: CreateInvitationUseCaseRequest): Promise<CreateInvitationUseCaseResponse> {
    const inviter = await this.usersRepository.findById(inviterId)

    if (!inviter) {
      throw new InviterNotFoundError()
    }

    const existingInvite =
      await this.coupleInvitesRepository.findByInviterIdAndInviteeEmail(
        inviter.id,
        email,
      )

    if (existingInvite) {
      throw new InvitationAlreadyExistsError()
    }

    const invite = await this.coupleInvitesRepository.create({
      inviter_id: inviter.id,
      invitee_email: email,
    })

    return { invite }
  }
}
