import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'

describe('Delete Account (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('should be able to delete user account', async () => {
    // Create a user
    await request(app.server).post('/users').send({
      name: 'User to Delete',
      email: 'delete@example.com',
      password: '123456',
      gender: 'MALE',
    })

    // Authenticate to get token
    const authResponse = await request(app.server).post('/users/login').send({
      email: 'delete@example.com',
      password: '123456',
    })

    const token = authResponse.body.access_token

    // Delete account
    const response = await request(app.server)
      .delete('/users/me')
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(204)
  })

  test('should not be able to access data after deleting account', async () => {
    // Create a user
    await request(app.server).post('/users').send({
      name: 'User to Delete 2',
      email: 'delete2@example.com',
      password: '123456',
      gender: 'MALE',
    })

    // Authenticate to get token
    const authResponse = await request(app.server).post('/users/login').send({
      email: 'delete2@example.com',
      password: '123456',
    })

    const token = authResponse.body.access_token

    // Delete account
    await request(app.server)
      .delete('/users/me')
      .set('Authorization', `Bearer ${token}`)

    // Try to access user data with the same token
    const response = await request(app.server)
      .get('/users/data')
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(404)
  })

  test('should not be able to login after deleting account', async () => {
    // Create a user
    await request(app.server).post('/users').send({
      name: 'User to Delete 3',
      email: 'delete3@example.com',
      password: '123456',
      gender: 'MALE',
    })

    // Authenticate to get token
    const authResponse = await request(app.server).post('/users/login').send({
      email: 'delete3@example.com',
      password: '123456',
    })

    const token = authResponse.body.access_token

    // Delete account
    await request(app.server)
      .delete('/users/me')
      .set('Authorization', `Bearer ${token}`)

    // Try to login again
    const response = await request(app.server).post('/users/login').send({
      email: 'delete3@example.com',
      password: '123456',
    })

    expect(response.statusCode).toBe(400)
  })

  test('should not be able to delete account without authentication', async () => {
    const response = await request(app.server).delete('/users/me')

    expect(response.statusCode).toBe(401)
  })

  test('should not be able to delete account with invalid token', async () => {
    const response = await request(app.server)
      .delete('/users/me')
      .set('Authorization', 'Bearer invalid-token')

    expect(response.statusCode).toBe(401)
  })
})
