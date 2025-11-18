import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'

describe('Decline Invitation (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('should be able to decline an invitation', async () => {
    // Create inviter
    await request(app.server).post('/users').send({
      name: 'Decline Inviter',
      email: 'decline-inviter@example.com',
      password: '123456',
      gender: 'MALE',
    })

    // Create invited user
    await request(app.server).post('/users').send({
      name: 'Decline Invited',
      email: 'decline-invited@example.com',
      password: '123456',
      gender: 'FEMALE',
    })

    const auth1 = await request(app.server).post('/users/login').send({
      email: 'decline-inviter@example.com',
      password: '123456',
    })

    const token1 = auth1.body.access_token

    const auth2 = await request(app.server).post('/users/login').send({
      email: 'decline-invited@example.com',
      password: '123456',
    })

    const token2 = auth2.body.access_token

    // Create invitation
    const inviteResponse = await request(app.server)
      .post('/couple-invitations/invite')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        email: 'decline-invited@example.com',
      })

    const inviteId = inviteResponse.body.invite.id

    // Decline invitation
    const response = await request(app.server)
      .post(`/couple-invitations/${inviteId}/decline`)
      .set('Authorization', `Bearer ${token2}`)

    expect(response.statusCode).toBe(200)
  })

  test('should not create a couple when invitation is declined', async () => {
    // Create inviter
    await request(app.server).post('/users').send({
      name: 'No Couple Inviter',
      email: 'no-couple-inviter@example.com',
      password: '123456',
      gender: 'MALE',
    })

    // Create invited user
    await request(app.server).post('/users').send({
      name: 'No Couple Invited',
      email: 'no-couple-invited@example.com',
      password: '123456',
      gender: 'FEMALE',
    })

    const auth1 = await request(app.server).post('/users/login').send({
      email: 'no-couple-inviter@example.com',
      password: '123456',
    })

    const token1 = auth1.body.access_token

    const auth2 = await request(app.server).post('/users/login').send({
      email: 'no-couple-invited@example.com',
      password: '123456',
    })

    const token2 = auth2.body.access_token

    // Create invitation
    const inviteResponse = await request(app.server)
      .post('/couple-invitations/invite')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        email: 'no-couple-invited@example.com',
      })

    const inviteId = inviteResponse.body.invite.id

    // Decline invitation
    await request(app.server)
      .post(`/couple-invitations/${inviteId}/decline`)
      .set('Authorization', `Bearer ${token2}`)

    // Verify couple was not created
    const coupleDetails = await request(app.server)
      .get('/couples/details')
      .set('Authorization', `Bearer ${token1}`)

    expect(coupleDetails.statusCode).toBe(404)
  })

  test('should return 404 when invitation does not exist', async () => {
    // Create user
    await request(app.server).post('/users').send({
      name: 'Decline Not Found User',
      email: 'decline-not-found@example.com',
      password: '123456',
      gender: 'MALE',
    })

    const auth = await request(app.server).post('/users/login').send({
      email: 'decline-not-found@example.com',
      password: '123456',
    })

    const token = auth.body.access_token

    // Try to decline non-existent invitation
    const response = await request(app.server)
      .post('/couple-invitations/999999/decline')
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(404)
  })

  test('should return 400 when invitation is already declined', async () => {
    // Create inviter
    await request(app.server).post('/users').send({
      name: 'Already Declined Inviter',
      email: 'already-declined-inviter@example.com',
      password: '123456',
      gender: 'MALE',
    })

    // Create invited user
    await request(app.server).post('/users').send({
      name: 'Already Declined Invited',
      email: 'already-declined-invited@example.com',
      password: '123456',
      gender: 'FEMALE',
    })

    const auth1 = await request(app.server).post('/users/login').send({
      email: 'already-declined-inviter@example.com',
      password: '123456',
    })

    const token1 = auth1.body.access_token

    const auth2 = await request(app.server).post('/users/login').send({
      email: 'already-declined-invited@example.com',
      password: '123456',
    })

    const token2 = auth2.body.access_token

    // Create invitation
    const inviteResponse = await request(app.server)
      .post('/couple-invitations/invite')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        email: 'already-declined-invited@example.com',
      })

    const inviteId = inviteResponse.body.invite.id

    // Decline invitation first time
    await request(app.server)
      .post(`/couple-invitations/${inviteId}/decline`)
      .set('Authorization', `Bearer ${token2}`)

    // Try to decline again
    const response = await request(app.server)
      .post(`/couple-invitations/${inviteId}/decline`)
      .set('Authorization', `Bearer ${token2}`)

    expect(response.statusCode).toBe(400)
  })

  test('should return 400 when invitation is already accepted', async () => {
    // Create inviter
    await request(app.server).post('/users').send({
      name: 'Decline After Accept Inviter',
      email: 'decline-after-accept-inviter@example.com',
      password: '123456',
      gender: 'MALE',
    })

    // Create invited user
    await request(app.server).post('/users').send({
      name: 'Decline After Accept Invited',
      email: 'decline-after-accept-invited@example.com',
      password: '123456',
      gender: 'FEMALE',
    })

    const auth1 = await request(app.server).post('/users/login').send({
      email: 'decline-after-accept-inviter@example.com',
      password: '123456',
    })

    const token1 = auth1.body.access_token

    const auth2 = await request(app.server).post('/users/login').send({
      email: 'decline-after-accept-invited@example.com',
      password: '123456',
    })

    const token2 = auth2.body.access_token

    // Create invitation
    const inviteResponse = await request(app.server)
      .post('/couple-invitations/invite')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        email: 'decline-after-accept-invited@example.com',
      })

    const inviteId = inviteResponse.body.invite.id

    // Accept invitation
    await request(app.server)
      .post(`/couple-invitations/${inviteId}/accept`)
      .set('Authorization', `Bearer ${token2}`)

    // Try to decline after accept
    const response = await request(app.server)
      .post(`/couple-invitations/${inviteId}/decline`)
      .set('Authorization', `Bearer ${token2}`)

    expect(response.statusCode).toBe(400)
  })

  test('should not be able to decline invitation without authentication', async () => {
    const response = await request(app.server).post(
      '/couple-invitations/1/decline',
    )

    expect(response.statusCode).toBe(401)
  })

  test('should not be able to decline invitation with invalid token', async () => {
    const response = await request(app.server)
      .post('/couple-invitations/1/decline')
      .set('Authorization', 'Bearer invalid-token')

    expect(response.statusCode).toBe(401)
  })
})
