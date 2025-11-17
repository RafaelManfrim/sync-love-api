import { beforeEach, describe, expect, test } from 'vitest'
import { hash } from 'bcryptjs'

import { AcceptInvitationUseCase } from './accept-invitation'
import { InMemoryUsersRepository } from '@repositories/in-memory/in-memory-users-repository'
import { InMemoryCoupleInvitesRepository } from '@repositories/in-memory/in-memory-couple-invites-repository'
import { InMemoryCouplesRepository } from '@repositories/in-memory/in-memory-couples-repository'
import { InvitationNotFoundError } from './errors/invitation-not-found-error'
import { UserNotFoundError } from './errors/user-not-found-error'
import { InvitationAlreadyRejectedError } from './errors/invitation-already-rejected-error'
import { InvitationAlreadyAcceptedError } from './errors/invitation-already-accepted-error'

let usersRepository: InMemoryUsersRepository
let coupleInvitesRepository: InMemoryCoupleInvitesRepository
let couplesRepository: InMemoryCouplesRepository
let sut: AcceptInvitationUseCase

describe('Accept Invitation Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    coupleInvitesRepository = new InMemoryCoupleInvitesRepository()
    couplesRepository = new InMemoryCouplesRepository()
    couplesRepository.users = usersRepository.items
    sut = new AcceptInvitationUseCase(
      coupleInvitesRepository,
      usersRepository,
      couplesRepository,
    )
  })

  test('should be able to accept an invitation', async () => {
    const inviter = await usersRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      password_hash: await hash('password123', 6),
      gender: 'MALE',
    })

    const invitee = await usersRepository.create({
      name: 'Jane Doe',
      email: 'jane@doe.com',
      password_hash: await hash('password123', 6),
      gender: 'FEMALE',
    })

    const invite = await coupleInvitesRepository.create({
      inviter_id: inviter.id,
      invitee_email: invitee.email,
    })

    const { couple } = await sut.execute({
      id: invite.id,
      userId: invitee.id,
    })

    expect(couple.id).toEqual(expect.any(Number))
    expect(couple.inviter_id).toBe(inviter.id)
    expect(couple.invitee_id).toBe(invitee.id)
    expect(couple.invite_id).toBe(invite.id)
    expect(couple.is_active).toBe(true)
  })

  test('should update both users with couple_id after accepting invitation', async () => {
    const inviter = await usersRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      password_hash: await hash('password123', 6),
      gender: 'MALE',
    })

    const invitee = await usersRepository.create({
      name: 'Jane Doe',
      email: 'jane@doe.com',
      password_hash: await hash('password123', 6),
      gender: 'FEMALE',
    })

    const invite = await coupleInvitesRepository.create({
      inviter_id: inviter.id,
      invitee_email: invitee.email,
    })

    const { couple } = await sut.execute({
      id: invite.id,
      userId: invitee.id,
    })

    const updatedInviter = await usersRepository.findById(inviter.id)
    const updatedInvitee = await usersRepository.findById(invitee.id)

    expect(updatedInviter?.couple_id).toBe(couple.id)
    expect(updatedInvitee?.couple_id).toBe(couple.id)
  })

  test('should mark invitation as accepted', async () => {
    const inviter = await usersRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      password_hash: await hash('password123', 6),
      gender: 'MALE',
    })

    const invitee = await usersRepository.create({
      name: 'Jane Doe',
      email: 'jane@doe.com',
      password_hash: await hash('password123', 6),
      gender: 'FEMALE',
    })

    const invite = await coupleInvitesRepository.create({
      inviter_id: inviter.id,
      invitee_email: invitee.email,
    })

    await sut.execute({
      id: invite.id,
      userId: invitee.id,
    })

    const acceptedInvite = await coupleInvitesRepository.findById(invite.id)

    expect(acceptedInvite?.accepted_at).toBeInstanceOf(Date)
    expect(acceptedInvite?.rejected_at).toBeNull()
  })

  test('should not be able to accept non-existent invitation', async () => {
    const invitee = await usersRepository.create({
      name: 'Jane Doe',
      email: 'jane@doe.com',
      password_hash: await hash('password123', 6),
      gender: 'FEMALE',
    })

    await expect(() =>
      sut.execute({
        id: 999,
        userId: invitee.id,
      }),
    ).rejects.toBeInstanceOf(InvitationNotFoundError)
  })

  test('should not be able to accept invitation with non-existent user', async () => {
    const inviter = await usersRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      password_hash: await hash('password123', 6),
      gender: 'MALE',
    })

    const invite = await coupleInvitesRepository.create({
      inviter_id: inviter.id,
      invitee_email: 'jane@doe.com',
    })

    await expect(() =>
      sut.execute({
        id: invite.id,
        userId: 999,
      }),
    ).rejects.toBeInstanceOf(UserNotFoundError)
  })

  test('should not be able to accept invitation with wrong email', async () => {
    const inviter = await usersRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      password_hash: await hash('password123', 6),
      gender: 'MALE',
    })

    const invitee = await usersRepository.create({
      name: 'Jane Doe',
      email: 'jane@doe.com',
      password_hash: await hash('password123', 6),
      gender: 'FEMALE',
    })

    const wrongUser = await usersRepository.create({
      name: 'Mary Jane',
      email: 'mary@jane.com',
      password_hash: await hash('password123', 6),
      gender: 'FEMALE',
    })

    const invite = await coupleInvitesRepository.create({
      inviter_id: inviter.id,
      invitee_email: invitee.email,
    })

    await expect(() =>
      sut.execute({
        id: invite.id,
        userId: wrongUser.id,
      }),
    ).rejects.toBeInstanceOf(InvitationNotFoundError)
  })

  test('should not be able to accept already rejected invitation', async () => {
    const inviter = await usersRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      password_hash: await hash('password123', 6),
      gender: 'MALE',
    })

    const invitee = await usersRepository.create({
      name: 'Jane Doe',
      email: 'jane@doe.com',
      password_hash: await hash('password123', 6),
      gender: 'FEMALE',
    })

    const invite = await coupleInvitesRepository.create({
      inviter_id: inviter.id,
      invitee_email: invitee.email,
    })

    await coupleInvitesRepository.declineById(invite.id)

    await expect(() =>
      sut.execute({
        id: invite.id,
        userId: invitee.id,
      }),
    ).rejects.toBeInstanceOf(InvitationAlreadyRejectedError)
  })

  test('should not be able to accept already accepted invitation', async () => {
    const inviter = await usersRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      password_hash: await hash('password123', 6),
      gender: 'MALE',
    })

    const invitee = await usersRepository.create({
      name: 'Jane Doe',
      email: 'jane@doe.com',
      password_hash: await hash('password123', 6),
      gender: 'FEMALE',
    })

    const invite = await coupleInvitesRepository.create({
      inviter_id: inviter.id,
      invitee_email: invitee.email,
    })

    await sut.execute({
      id: invite.id,
      userId: invitee.id,
    })

    await expect(() =>
      sut.execute({
        id: invite.id,
        userId: invitee.id,
      }),
    ).rejects.toBeInstanceOf(InvitationAlreadyAcceptedError)
  })
})
