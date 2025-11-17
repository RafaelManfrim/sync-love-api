import { beforeEach, describe, expect, it } from 'vitest'
import { DeclineInvitationUseCase } from './decline-invitation'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { InMemoryCoupleInvitesRepository } from '@/repositories/in-memory/in-memory-couple-invites-repository'
import { hash } from 'bcryptjs'
import { UserNotFoundError } from './errors/user-not-found-error'
import { InvitationNotFoundError } from './errors/invitation-not-found-error'
import { InvitationAlreadyRejectedError } from './errors/invitation-already-rejected-error'
import { InvitationAlreadyAcceptedError } from './errors/invitation-already-accepted-error'

let usersRepository: InMemoryUsersRepository
let coupleInvitesRepository: InMemoryCoupleInvitesRepository
let sut: DeclineInvitationUseCase

describe('Decline Invitation Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    coupleInvitesRepository = new InMemoryCoupleInvitesRepository()
    sut = new DeclineInvitationUseCase(coupleInvitesRepository, usersRepository)
  })

  it('should be able to decline an invitation', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
    })

    const invite = await coupleInvitesRepository.create({
      invitee_email: user.email,
      inviter_id: 2,
    })

    await sut.execute({
      id: invite.id,
      userId: user.id,
    })

    const declinedInvite = await coupleInvitesRepository.findById(invite.id)
    expect(declinedInvite?.rejected_at).toBeInstanceOf(Date)
  })

  it('should not be able to decline if user does not exist', async () => {
    const invite = await coupleInvitesRepository.create({
      invitee_email: 'john@example.com',
      inviter_id: 2,
    })

    await expect(() =>
      sut.execute({
        id: invite.id,
        userId: 999,
      }),
    ).rejects.toBeInstanceOf(UserNotFoundError)
  })

  it('should not be able to decline if invitation does not exist', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
    })

    await expect(() =>
      sut.execute({
        id: 999,
        userId: user.id,
      }),
    ).rejects.toBeInstanceOf(InvitationNotFoundError)
  })

  it('should not be able to decline an already rejected invitation', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
    })

    const invite = await coupleInvitesRepository.create({
      invitee_email: user.email,
      inviter_id: 2,
      rejected_at: new Date(),
    })

    await expect(() =>
      sut.execute({
        id: invite.id,
        userId: user.id,
      }),
    ).rejects.toBeInstanceOf(InvitationAlreadyRejectedError)
  })

  it('should not be able to decline an already accepted invitation', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
    })

    const invite = await coupleInvitesRepository.create({
      invitee_email: user.email,
      inviter_id: 2,
      accepted_at: new Date(),
    })

    await expect(() =>
      sut.execute({
        id: invite.id,
        userId: user.id,
      }),
    ).rejects.toBeInstanceOf(InvitationAlreadyAcceptedError)
  })
})
