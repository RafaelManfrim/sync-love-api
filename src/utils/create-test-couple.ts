import request from 'supertest'
import { app } from '@/app'

// Helper function to create a couple and return their tokens
export async function createCouple(suffix: string) {
  const email1 = `calendar-user1-${suffix}@example.com`
  const email2 = `calendar-user2-${suffix}@example.com`

  await request(app.server)
    .post('/users')
    .send({
      name: `User 1 ${suffix}`,
      email: email1,
      password: '123456',
      gender: 'MALE',
    })

  await request(app.server)
    .post('/users')
    .send({
      name: `User 2 ${suffix}`,
      email: email2,
      password: '123456',
      gender: 'FEMALE',
    })

  const auth1 = await request(app.server).post('/users/login').send({
    email: email1,
    password: '123456',
  })

  const auth2 = await request(app.server).post('/users/login').send({
    email: email2,
    password: '123456',
  })

  const token1 = auth1.body.access_token
  const token2 = auth2.body.access_token

  // Create relationship
  const invite = await request(app.server)
    .post('/couple-invitations/invite')
    .set('Authorization', `Bearer ${token1}`)
    .send({
      email: email2,
    })

  await request(app.server)
    .post(`/couple-invitations/${invite.body.invite.id}/accept`)
    .set('Authorization', `Bearer ${token2}`)

  const auth3 = await request(app.server).post('/users/login').send({
    email: email1,
    password: '123456',
  })

  const auth4 = await request(app.server).post('/users/login').send({
    email: email2,
    password: '123456',
  })

  return {
    token1: auth3.body.access_token,
    token2: auth4.body.access_token,
    user1: auth3.body.user,
    user2: auth4.body.user,
  }
}
