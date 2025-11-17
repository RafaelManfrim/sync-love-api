import { beforeEach, describe, expect, test } from 'vitest'

import { CreateInvitationUseCase } from './create-invitation'
import { InMemoryUsersRepository } from '@repositories/in-memory/in-memory-users-repository'
import { InMemoryCoupleInvitesRepository } from '@repositories/in-memory/in-memory-couple-invites-repository'
import { InviterNotFoundError } from './errors/inviter-not-found-error'
import { InvitationAlreadyExistsError } from './errors/invitation-already-exists-error'
import { hash } from 'bcryptjs'

let usersRepository: InMemoryUsersRepository
let coupleInvitesRepository: InMemoryCoupleInvitesRepository
let sut: CreateInvitationUseCase

describe('Create Invitation Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    coupleInvitesRepository = new InMemoryCoupleInvitesRepository()
    sut = new CreateInvitationUseCase(usersRepository, coupleInvitesRepository)
  })

  test('should be able to create a new invitation', async () => {
    const inviter = await usersRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      password_hash: await hash('password123', 6),
      gender: 'MALE',
    })

    const { invite } = await sut.execute({
      inviterId: inviter.id,
      email: 'jane@doe.com',
    })

    expect(invite.id).toEqual(expect.any(Number))
    expect(invite.inviter_id).toBe(inviter.id)
    expect(invite.invitee_email).toBe('jane@doe.com')
    expect(invite.invited_at).toBeInstanceOf(Date)
    expect(invite.accepted_at).toBeNull()
    expect(invite.rejected_at).toBeNull()
  })

  test('should not be able to create invitation with non-existent inviter', async () => {
    await expect(() =>
      sut.execute({
        inviterId: 999,
        email: 'jane@doe.com',
      }),
    ).rejects.toBeInstanceOf(InviterNotFoundError)
  })

  test('should not be able to create duplicate invitation', async () => {
    const inviter = await usersRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      password_hash: await hash('password123', 6),
      gender: 'MALE',
    })

    const inviteeEmail = 'jane@doe.com'

    await sut.execute({
      inviterId: inviter.id,
      email: inviteeEmail,
    })

    await expect(() =>
      sut.execute({
        inviterId: inviter.id,
        email: inviteeEmail,
      }),
    ).rejects.toBeInstanceOf(InvitationAlreadyExistsError)
  })

  test('should be able to create invitation to different emails', async () => {
    const inviter = await usersRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      password_hash: await hash('password123', 6),
      gender: 'MALE',
    })

    const { invite: invite1 } = await sut.execute({
      inviterId: inviter.id,
      email: 'jane@doe.com',
    })

    const { invite: invite2 } = await sut.execute({
      inviterId: inviter.id,
      email: 'mary@jane.com',
    })

    expect(invite1.invitee_email).toBe('jane@doe.com')
    expect(invite2.invitee_email).toBe('mary@jane.com')
    expect(invite1.id).not.toBe(invite2.id)
  })

  test('should store invitation in repository', async () => {
    const inviter = await usersRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      password_hash: await hash('password123', 6),
      gender: 'MALE',
    })

    await sut.execute({
      inviterId: inviter.id,
      email: 'jane@doe.com',
    })

    const invitations = await coupleInvitesRepository.listByUserId(inviter.id)

    expect(invitations).toHaveLength(1)
    expect(invitations[0].invitee_email).toBe('jane@doe.com')
  })
})
