import { beforeEach, describe, expect, it } from 'vitest'
import { ExcludeInvitationUseCase } from './exclude-invitation'
import { InMemoryCoupleInvitesRepository } from '@/repositories/in-memory/in-memory-couple-invites-repository'
import { InvitationNotFoundError } from './errors/invitation-not-found-error'

let coupleInvitesRepository: InMemoryCoupleInvitesRepository
let sut: ExcludeInvitationUseCase

describe('Exclude Invitation Use Case', () => {
  beforeEach(() => {
    coupleInvitesRepository = new InMemoryCoupleInvitesRepository()
    sut = new ExcludeInvitationUseCase(coupleInvitesRepository)
  })

  it('should be able to exclude an invitation', async () => {
    const invite = await coupleInvitesRepository.create({
      invitee_email: 'partner@example.com',
      inviter_id: 1,
    })

    await sut.execute({
      id: invite.id,
      userId: 1,
    })

    const deletedInvite = await coupleInvitesRepository.findById(invite.id)
    expect(deletedInvite).toBeNull()
  })

  it('should not be able to exclude if invitation does not exist', async () => {
    await expect(() =>
      sut.execute({
        id: 999,
        userId: 1,
      }),
    ).rejects.toBeInstanceOf(InvitationNotFoundError)
  })

  it('should not be able to exclude invitation from another user', async () => {
    const invite = await coupleInvitesRepository.create({
      invitee_email: 'partner@example.com',
      inviter_id: 2,
    })

    await expect(() =>
      sut.execute({
        id: invite.id,
        userId: 1,
      }),
    ).rejects.toBeInstanceOf(InvitationNotFoundError)
  })
})
