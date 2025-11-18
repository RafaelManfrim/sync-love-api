import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'

describe('Create Invitation (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('should be able to create an invitation', async () => {
    // Create inviter
    await request(app.server).post('/users').send({
      name: 'Inviter User',
      email: 'inviter@example.com',
      password: '123456',
      gender: 'MALE',
    })

    // Create invited user
    await request(app.server).post('/users').send({
      name: 'Invited User',
      email: 'invited@example.com',
      password: '123456',
      gender: 'FEMALE',
    })

    const auth = await request(app.server).post('/users/login').send({
      email: 'inviter@example.com',
      password: '123456',
    })

    const token = auth.body.access_token

    // Create invitation
    const response = await request(app.server)
      .post('/couple-invitations/invite')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'invited@example.com',
      })

    expect(response.statusCode).toBe(200)
    expect(response.body.invite).toBeDefined()
    expect(response.body.invite).toHaveProperty('id')
    expect(response.body.invite).toHaveProperty('inviter_id')
    expect(response.body.invite).toHaveProperty('invitee_email')
    expect(response.body.invite.invitee_email).toBe('invited@example.com')
  })

  test('should return 409 when invitation already exists', async () => {
    // Create inviter
    await request(app.server).post('/users').send({
      name: 'Duplicate Inviter',
      email: 'duplicate-inviter@example.com',
      password: '123456',
      gender: 'MALE',
    })

    // Create invited user
    await request(app.server).post('/users').send({
      name: 'Duplicate Invited',
      email: 'duplicate-invited@example.com',
      password: '123456',
      gender: 'FEMALE',
    })

    const auth = await request(app.server).post('/users/login').send({
      email: 'duplicate-inviter@example.com',
      password: '123456',
    })

    const token = auth.body.access_token

    // Create first invitation
    await request(app.server)
      .post('/couple-invitations/invite')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'duplicate-invited@example.com',
      })

    // Try to create duplicate invitation
    const response = await request(app.server)
      .post('/couple-invitations/invite')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'duplicate-invited@example.com',
      })

    expect(response.statusCode).toBe(409)
  })

  test('should return 400 when email is invalid', async () => {
    // Create inviter
    await request(app.server).post('/users').send({
      name: 'Invalid Email Inviter',
      email: 'invalid-email-inviter@example.com',
      password: '123456',
      gender: 'MALE',
    })

    const auth = await request(app.server).post('/users/login').send({
      email: 'invalid-email-inviter@example.com',
      password: '123456',
    })

    const token = auth.body.access_token

    // Try to create invitation with invalid email
    const response = await request(app.server)
      .post('/couple-invitations/invite')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'invalid-email',
      })

    expect(response.statusCode).toBe(400)
  })

  test('should return 400 when email is missing', async () => {
    // Create inviter
    await request(app.server).post('/users').send({
      name: 'Missing Email Inviter',
      email: 'missing-email-inviter@example.com',
      password: '123456',
      gender: 'MALE',
    })

    const auth = await request(app.server).post('/users/login').send({
      email: 'missing-email-inviter@example.com',
      password: '123456',
    })

    const token = auth.body.access_token

    // Try to create invitation without email
    const response = await request(app.server)
      .post('/couple-invitations/invite')
      .set('Authorization', `Bearer ${token}`)
      .send({})

    expect(response.statusCode).toBe(400)
  })

  test('should not be able to create invitation without authentication', async () => {
    const response = await request(app.server)
      .post('/couple-invitations/invite')
      .send({
        email: 'test@example.com',
      })

    expect(response.statusCode).toBe(401)
  })

  test('should not be able to create invitation with invalid token', async () => {
    const response = await request(app.server)
      .post('/couple-invitations/invite')
      .set('Authorization', 'Bearer invalid-token')
      .send({
        email: 'test@example.com',
      })

    expect(response.statusCode).toBe(401)
  })
})
