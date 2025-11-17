import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'

describe('Authenticate (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('if it authenticate a user with valid crendentials', async () => {
    await request(app.server).post('/users').send({
      name: 'test',
      email: 'test@example.com',
      password: 'testpassword',
    })

    const response = await request(app.server).post('/users/login').send({
      email: 'test@example.com',
      password: 'testpassword',
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      token: expect.any(String),
    })
  })
})
