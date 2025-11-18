import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'

describe('List Invitations (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('should be able to list received and sent invitations', async () => {
    // Create three users
    await request(app.server).post('/users').send({
      name: 'List User 1',
      email: 'list-user1@example.com',
      password: '123456',
      gender: 'MALE',
    })

    await request(app.server).post('/users').send({
      name: 'List User 2',
      email: 'list-user2@example.com',
      password: '123456',
      gender: 'FEMALE',
    })

    await request(app.server).post('/users').send({
      name: 'List User 3',
      email: 'list-user3@example.com',
      password: '123456',
      gender: 'MALE',
    })

    const auth1 = await request(app.server).post('/users/login').send({
      email: 'list-user1@example.com',
      password: '123456',
    })

    const token1 = auth1.body.access_token

    const auth2 = await request(app.server).post('/users/login').send({
      email: 'list-user2@example.com',
      password: '123456',
    })

    const token2 = auth2.body.access_token

    const auth3 = await request(app.server).post('/users/login').send({
      email: 'list-user3@example.com',
      password: '123456',
    })

    const token3 = auth3.body.access_token

    // User 1 sends invitation to User 2
    await request(app.server)
      .post('/couple-invitations/invite')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        email: 'list-user2@example.com',
      })

    // User 3 sends invitation to User 2
    await request(app.server)
      .post('/couple-invitations/invite')
      .set('Authorization', `Bearer ${token3}`)
      .send({
        email: 'list-user2@example.com',
      })

    // List invitations for User 2
    const response = await request(app.server)
      .get('/couple-invitations')
      .set('Authorization', `Bearer ${token2}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.recievedInvites).toBeInstanceOf(Array)
    expect(response.body.sentInvites).toBeInstanceOf(Array)
    expect(response.body.recievedInvites).toHaveLength(2)
    expect(response.body.sentInvites).toHaveLength(0)
  })

  test('should list sent invitations for inviter', async () => {
    // Create two users
    await request(app.server).post('/users').send({
      name: 'Sent Inviter',
      email: 'sent-inviter@example.com',
      password: '123456',
      gender: 'MALE',
    })

    await request(app.server).post('/users').send({
      name: 'Sent Invited',
      email: 'sent-invited@example.com',
      password: '123456',
      gender: 'FEMALE',
    })

    const auth1 = await request(app.server).post('/users/login').send({
      email: 'sent-inviter@example.com',
      password: '123456',
    })

    const token1 = auth1.body.access_token

    // Send invitation
    await request(app.server)
      .post('/couple-invitations/invite')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        email: 'sent-invited@example.com',
      })

    // List invitations
    const response = await request(app.server)
      .get('/couple-invitations')
      .set('Authorization', `Bearer ${token1}`)

    console.log(response.body)

    expect(response.statusCode).toBe(200)
    expect(response.body.sentInvites).toHaveLength(1)
    expect(response.body.recievedInvites).toHaveLength(0)
    expect(response.body.sentInvites[0].invitee_email).toBe(
      'sent-invited@example.com',
    )
  })

  test('should return empty arrays when user has no invitations', async () => {
    // Create user
    await request(app.server).post('/users').send({
      name: 'No Invitations User',
      email: 'no-invitations@example.com',
      password: '123456',
      gender: 'MALE',
    })

    const auth = await request(app.server).post('/users/login').send({
      email: 'no-invitations@example.com',
      password: '123456',
    })

    const token = auth.body.access_token

    // List invitations
    const response = await request(app.server)
      .get('/couple-invitations')
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.recievedInvites).toHaveLength(0)
    expect(response.body.sentInvites).toHaveLength(0)
  })

  // test('should not include accepted invitations in the list', async () => {
  //   // Create two users
  //   await request(app.server).post('/users').send({
  //     name: 'Accepted List Inviter',
  //     email: 'accepted-list-inviter@example.com',
  //     password: '123456',
  //     gender: 'MALE',
  //   })

  //   await request(app.server).post('/users').send({
  //     name: 'Accepted List Invited',
  //     email: 'accepted-list-invited@example.com',
  //     password: '123456',
  //     gender: 'FEMALE',
  //   })

  //   const auth1 = await request(app.server).post('/users/login').send({
  //     email: 'accepted-list-inviter@example.com',
  //     password: '123456',
  //   })

  //   const token1 = auth1.body.access_token

  //   const auth2 = await request(app.server).post('/users/login').send({
  //     email: 'accepted-list-invited@example.com',
  //     password: '123456',
  //   })

  //   const token2 = auth2.body.access_token

  //   // Send invitation
  //   const inviteResponse = await request(app.server)
  //     .post('/couple-invitations/invite')
  //     .set('Authorization', `Bearer ${token1}`)
  //     .send({
  //       email: 'accepted-list-invited@example.com',
  //     })

  //   const inviteId = inviteResponse.body.invite.id

  //   // Accept invitation
  //   await request(app.server)
  //     .post(`/couple-invitations/${inviteId}/accept`)
  //     .set('Authorization', `Bearer ${token2}`)

  //   // List invitations for inviter
  //   const response1 = await request(app.server)
  //     .get('/couple-invitations')
  //     .set('Authorization', `Bearer ${token1}`)

  //   // List invitations for invited
  //   const response2 = await request(app.server)
  //     .get('/couple-invitations')
  //     .set('Authorization', `Bearer ${token2}`)

  //   // Both should have no pending invitations
  //   expect(response1.statusCode).toBe(200)
  //   expect(response2.statusCode).toBe(200)
  //   expect(response1.body.sentInvites).toHaveLength(0)
  //   expect(response2.body.recievedInvites).toHaveLength(0)
  // })

  // test('should not include declined invitations in the list', async () => {
  //   // Create two users
  //   await request(app.server).post('/users').send({
  //     name: 'Declined List Inviter',
  //     email: 'declined-list-inviter@example.com',
  //     password: '123456',
  //     gender: 'MALE',
  //   })

  //   await request(app.server).post('/users').send({
  //     name: 'Declined List Invited',
  //     email: 'declined-list-invited@example.com',
  //     password: '123456',
  //     gender: 'FEMALE',
  //   })

  //   const auth1 = await request(app.server).post('/users/login').send({
  //     email: 'declined-list-inviter@example.com',
  //     password: '123456',
  //   })

  //   const token1 = auth1.body.access_token

  //   const auth2 = await request(app.server).post('/users/login').send({
  //     email: 'declined-list-invited@example.com',
  //     password: '123456',
  //   })

  //   const token2 = auth2.body.access_token

  //   // Send invitation
  //   const inviteResponse = await request(app.server)
  //     .post('/couple-invitations/invite')
  //     .set('Authorization', `Bearer ${token1}`)
  //     .send({
  //       email: 'declined-list-invited@example.com',
  //     })

  //   const inviteId = inviteResponse.body.invite.id

  //   // Decline invitation
  //   await request(app.server)
  //     .post(`/couple-invitations/${inviteId}/decline`)
  //     .set('Authorization', `Bearer ${token2}`)

  //   // List invitations for inviter
  //   const response1 = await request(app.server)
  //     .get('/couple-invitations')
  //     .set('Authorization', `Bearer ${token1}`)

  //   // List invitations for invited
  //   const response2 = await request(app.server)
  //     .get('/couple-invitations')
  //     .set('Authorization', `Bearer ${token2}`)

  //   // Both should have no pending invitations
  //   expect(response1.statusCode).toBe(200)
  //   expect(response2.statusCode).toBe(200)
  //   expect(response1.body.sentInvites).toHaveLength(0)
  //   expect(response2.body.recievedInvites).toHaveLength(0)
  // })

  test('should not be able to list invitations without authentication', async () => {
    const response = await request(app.server).get('/couple-invitations')

    expect(response.statusCode).toBe(401)
  })

  test('should not be able to list invitations with invalid token', async () => {
    const response = await request(app.server)
      .get('/couple-invitations')
      .set('Authorization', 'Bearer invalid-token')

    expect(response.statusCode).toBe(401)
  })
})
