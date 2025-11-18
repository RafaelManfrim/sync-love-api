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
    expect(response.body.access_token).toEqual(expect.any(String))
    expect(response.body.refresh_token).toEqual(expect.any(String))
    expect(response.body.user).toHaveProperty('id', expect.any(Number))
    expect(response.body.user).toHaveProperty('name', 'test')
    expect(response.body.user).toHaveProperty('email', 'test@example.com')
    expect(response.body.user.password_hash).toBeUndefined()
  })

  test('should not be able to authenticate with invalid password', async () => {
    await request(app.server).post('/users').send({
      name: 'test2',
      email: 'test2@example.com',
      password: 'testpassword',
    })

    const response = await request(app.server).post('/users/login').send({
      email: 'test2@example.com',
      password: 'wrongpassword',
    })

    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('code', 'INVALID_CREDENTIALS')
  })

  test('should not be able to authenticate with non existing user', async () => {
    const response = await request(app.server).post('/users/login').send({
      email: 'nonexisting@example.com',
      password: 'wrongpassword',
    })

    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('code', 'INVALID_CREDENTIALS')
  })
})
