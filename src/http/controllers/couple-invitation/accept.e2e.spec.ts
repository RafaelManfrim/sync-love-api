import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'

describe('Accept Invitation (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('should be able to accept an invitation', async () => {
    // Create inviter
    await request(app.server).post('/users').send({
      name: 'Accept Inviter',
      email: 'accept-inviter@example.com',
      password: '123456',
      gender: 'MALE',
    })

    // Create invited user
    await request(app.server).post('/users').send({
      name: 'Accept Invited',
      email: 'accept-invited@example.com',
      password: '123456',
      gender: 'FEMALE',
    })

    const auth1 = await request(app.server).post('/users/login').send({
      email: 'accept-inviter@example.com',
      password: '123456',
    })

    const token1 = auth1.body.access_token

    const auth2 = await request(app.server).post('/users/login').send({
      email: 'accept-invited@example.com',
      password: '123456',
    })

    const token2 = auth2.body.access_token

    // Create invitation
    const inviteResponse = await request(app.server)
      .post('/couple-invitations/invite')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        email: 'accept-invited@example.com',
      })

    const inviteId = inviteResponse.body.invite.id

    // Accept invitation
    const response = await request(app.server)
      .post(`/couple-invitations/${inviteId}/accept`)
      .set('Authorization', `Bearer ${token2}`)

    expect(response.statusCode).toBe(201)
    expect(response.body.couple).toBeDefined()
    expect(response.body.couple).toHaveProperty('id')

    expect(response.body.couple).toHaveProperty('invite_id')
    expect(response.body.couple).toHaveProperty('inviter_id')
    expect(response.body.couple).toHaveProperty('invitee_id')
    expect(response.body.couple).toHaveProperty('created_at')
    expect(response.body.couple).toHaveProperty('is_active', true)
  })

  test('should create a couple when invitation is accepted', async () => {
    // Create inviter
    await request(app.server).post('/users').send({
      name: 'Couple Inviter',
      email: 'couple-inviter@example.com',
      password: '123456',
      gender: 'MALE',
    })

    // Create invited user
    await request(app.server).post('/users').send({
      name: 'Couple Invited',
      email: 'couple-invited@example.com',
      password: '123456',
      gender: 'FEMALE',
    })

    const auth1 = await request(app.server).post('/users/login').send({
      email: 'couple-inviter@example.com',
      password: '123456',
    })

    const token1 = auth1.body.access_token

    const auth2 = await request(app.server).post('/users/login').send({
      email: 'couple-invited@example.com',
      password: '123456',
    })

    const token2 = auth2.body.access_token

    // Create invitation
    const inviteResponse = await request(app.server)
      .post('/couple-invitations/invite')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        email: 'couple-invited@example.com',
      })

    const inviteId = inviteResponse.body.invite.id

    // Accept invitation
    await request(app.server)
      .post(`/couple-invitations/${inviteId}/accept`)
      .set('Authorization', `Bearer ${token2}`)

    // Verify couple was created
    const coupleDetails = await request(app.server)
      .get('/couples/details')
      .set('Authorization', `Bearer ${token1}`)

    expect(coupleDetails.statusCode).toBe(200)
    expect(coupleDetails.body.coupleDetails).toBeDefined()
  })

  test('should return 404 when invitation does not exist', async () => {
    // Create user
    await request(app.server).post('/users').send({
      name: 'Not Found User',
      email: 'not-found-user@example.com',
      password: '123456',
      gender: 'MALE',
    })

    const auth = await request(app.server).post('/users/login').send({
      email: 'not-found-user@example.com',
      password: '123456',
    })

    const token = auth.body.access_token

    // Try to accept non-existent invitation
    const response = await request(app.server)
      .post('/couple-invitations/999999/accept')
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(404)
  })

  test('should return 400 when invitation is already accepted', async () => {
    // Create inviter
    await request(app.server).post('/users').send({
      name: 'Already Accepted Inviter',
      email: 'already-accepted-inviter@example.com',
      password: '123456',
      gender: 'MALE',
    })

    // Create invited user
    await request(app.server).post('/users').send({
      name: 'Already Accepted Invited',
      email: 'already-accepted-invited@example.com',
      password: '123456',
      gender: 'FEMALE',
    })

    const auth1 = await request(app.server).post('/users/login').send({
      email: 'already-accepted-inviter@example.com',
      password: '123456',
    })

    const token1 = auth1.body.access_token

    const auth2 = await request(app.server).post('/users/login').send({
      email: 'already-accepted-invited@example.com',
      password: '123456',
    })

    const token2 = auth2.body.access_token

    // Create invitation
    const inviteResponse = await request(app.server)
      .post('/couple-invitations/invite')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        email: 'already-accepted-invited@example.com',
      })

    const inviteId = inviteResponse.body.invite.id

    // Accept invitation first time
    await request(app.server)
      .post(`/couple-invitations/${inviteId}/accept`)
      .set('Authorization', `Bearer ${token2}`)

    // Try to accept again
    const response = await request(app.server)
      .post(`/couple-invitations/${inviteId}/accept`)
      .set('Authorization', `Bearer ${token2}`)

    expect(response.statusCode).toBe(400)
  })

  test('should return 400 when invitation is already rejected', async () => {
    // Create inviter
    await request(app.server).post('/users').send({
      name: 'Rejected Inviter',
      email: 'rejected-inviter@example.com',
      password: '123456',
      gender: 'MALE',
    })

    // Create invited user
    await request(app.server).post('/users').send({
      name: 'Rejected Invited',
      email: 'rejected-invited@example.com',
      password: '123456',
      gender: 'FEMALE',
    })

    const auth1 = await request(app.server).post('/users/login').send({
      email: 'rejected-inviter@example.com',
      password: '123456',
    })

    const token1 = auth1.body.access_token

    const auth2 = await request(app.server).post('/users/login').send({
      email: 'rejected-invited@example.com',
      password: '123456',
    })

    const token2 = auth2.body.access_token

    // Create invitation
    const inviteResponse = await request(app.server)
      .post('/couple-invitations/invite')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        email: 'rejected-invited@example.com',
      })

    const inviteId = inviteResponse.body.invite.id

    // Decline invitation
    await request(app.server)
      .post(`/couple-invitations/${inviteId}/decline`)
      .set('Authorization', `Bearer ${token2}`)

    // Try to accept after decline
    const response = await request(app.server)
      .post(`/couple-invitations/${inviteId}/accept`)
      .set('Authorization', `Bearer ${token2}`)

    expect(response.statusCode).toBe(400)
  })

  test('should not be able to accept invitation without authentication', async () => {
    const response = await request(app.server).post(
      '/couple-invitations/1/accept',
    )

    expect(response.statusCode).toBe(401)
  })

  test('should not be able to accept invitation with invalid token', async () => {
    const response = await request(app.server)
      .post('/couple-invitations/1/accept')
      .set('Authorization', 'Bearer invalid-token')

    expect(response.statusCode).toBe(401)
  })
})
