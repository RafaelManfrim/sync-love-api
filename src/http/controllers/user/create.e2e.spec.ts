import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'

describe('Register (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('should be able to register a new user', async () => {
    const response = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'john@example.com',
      password: '123456',
      gender: 'MALE',
    })

    expect(response.statusCode).toBe(201)
    expect(response.body.user).toHaveProperty('id', expect.any(Number))
    expect(response.body.user).toHaveProperty('name', 'John Doe')
    expect(response.body.user).toHaveProperty('email', 'john@example.com')
    expect(response.body.user).toHaveProperty('gender', 'MALE')
    expect(response.body.user.password_hash).toBeUndefined()
    expect(response.body.user).toHaveProperty('avatar_url')
    expect(response.body.user).toHaveProperty('couple_id')
    expect(response.body.user).toHaveProperty('created_at')
  })

  test('should use default gender MALE if not provided', async () => {
    const response = await request(app.server).post('/users').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: '123456',
    })

    expect(response.statusCode).toBe(201)
    expect(response.body.user).toHaveProperty('gender', 'MALE')
  })

  test('should be able to register with FEMALE gender', async () => {
    const response = await request(app.server).post('/users').send({
      name: 'Mary Smith',
      email: 'mary@example.com',
      password: '123456',
      gender: 'FEMALE',
    })

    expect(response.statusCode).toBe(201)
    expect(response.body.user).toHaveProperty('gender', 'FEMALE')
  })

  test('should not be able to register with duplicate email', async () => {
    const email = 'duplicate@example.com'

    await request(app.server).post('/users').send({
      name: 'User One',
      email,
      password: '123456',
      gender: 'MALE',
    })

    const response = await request(app.server).post('/users').send({
      name: 'User Two',
      email,
      password: '123456',
      gender: 'MALE',
    })

    expect(response.statusCode).toBe(409)
    expect(response.body).toHaveProperty('message')
    expect(response.body).toHaveProperty('code', 'USER_ALREADY_EXISTS')
  })

  test('should not be able to register without name', async () => {
    const response = await request(app.server).post('/users').send({
      email: 'noname@example.com',
      password: '123456',
      gender: 'MALE',
    })

    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR')
  })

  test('should not be able to register without email', async () => {
    const response = await request(app.server).post('/users').send({
      name: 'No Email',
      password: '123456',
      gender: 'MALE',
    })

    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR')
  })

  test('should not be able to register with invalid email', async () => {
    const response = await request(app.server).post('/users').send({
      name: 'Invalid Email',
      email: 'invalid-email',
      password: '123456',
      gender: 'MALE',
    })

    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR')
  })

  test('should not be able to register with password less than 6 characters', async () => {
    const response = await request(app.server).post('/users').send({
      name: 'Short Password',
      email: 'short@example.com',
      password: '12345',
      gender: 'MALE',
    })

    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR')
  })

  test('should not be able to register with invalid gender', async () => {
    const response = await request(app.server).post('/users').send({
      name: 'Invalid Gender',
      email: 'invalid@example.com',
      password: '123456',
      gender: 'OTHER',
    })

    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR')
  })
})
