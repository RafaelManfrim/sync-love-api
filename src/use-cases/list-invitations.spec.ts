import { beforeEach, describe, expect, it } from 'vitest'
import { ListInvitationsUseCase } from './list-invitations'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { InMemoryCoupleInvitesRepository } from '@/repositories/in-memory/in-memory-couple-invites-repository'
import { hash } from 'bcryptjs'
import { UserNotFoundError } from './errors/user-not-found-error'

let usersRepository: InMemoryUsersRepository
let coupleInvitesRepository: InMemoryCoupleInvitesRepository
let sut: ListInvitationsUseCase

describe('List Invitations Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    coupleInvitesRepository = new InMemoryCoupleInvitesRepository()
    sut = new ListInvitationsUseCase(usersRepository, coupleInvitesRepository)
  })

  it('should be able to list received invitations', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
    })

    await coupleInvitesRepository.create({
      invitee_email: user.email,
      inviter_id: 2,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
    })

    await coupleInvitesRepository.create({
      invitee_email: user.email,
      inviter_id: 3,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
    })

    const { recievedInvites } = await sut.execute({ userId: user.id })

    expect(recievedInvites).toHaveLength(2)
  })

  it('should be able to list sent invitations', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
    })

    await coupleInvitesRepository.create({
      invitee_email: 'partner1@example.com',
      inviter_id: user.id,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
    })

    await coupleInvitesRepository.create({
      invitee_email: 'partner2@example.com',
      inviter_id: user.id,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
    })

    const { sentInvites } = await sut.execute({ userId: user.id })

    expect(sentInvites).toHaveLength(2)
  })

  it('should return empty arrays if user has no invitations', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
    })

    const { recievedInvites, sentInvites } = await sut.execute({
      userId: user.id,
    })

    expect(recievedInvites).toHaveLength(0)
    expect(sentInvites).toHaveLength(0)
  })

  it('should not be able to list invitations if user does not exist', async () => {
    await expect(() => sut.execute({ userId: 999 })).rejects.toBeInstanceOf(
      UserNotFoundError,
    )
  })
})
