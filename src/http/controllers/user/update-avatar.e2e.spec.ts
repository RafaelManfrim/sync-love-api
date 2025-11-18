import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import path from 'node:path'
import fs from 'node:fs'

describe('Update Avatar (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('should be able to update user avatar', async () => {
    // Create a user
    await request(app.server).post('/users').send({
      name: 'Avatar User',
      email: 'avatar@example.com',
      password: '123456',
      gender: 'MALE',
    })

    // Authenticate
    const authResponse = await request(app.server).post('/users/login').send({
      email: 'avatar@example.com',
      password: '123456',
    })

    const token = authResponse.body.access_token

    // Create a test image file
    const testImagePath = path.join(__dirname, 'test-avatar.png')
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    )
    fs.writeFileSync(testImagePath, testImageBuffer)

    // Upload avatar
    const response = await request(app.server)
      .patch('/users/avatar')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', testImagePath)

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('avatarUrl')
    expect(response.body.avatarUrl).toEqual(expect.any(String))

    // Clean up test file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath)
    }
  })

  test('should be able to update avatar multiple times', async () => {
    // Create a user
    await request(app.server).post('/users').send({
      name: 'Multiple Avatar User',
      email: 'multiple-avatar@example.com',
      password: '123456',
      gender: 'MALE',
    })

    // Authenticate
    const authResponse = await request(app.server).post('/users/login').send({
      email: 'multiple-avatar@example.com',
      password: '123456',
    })

    const token = authResponse.body.access_token

    // Create test images
    const testImagePath1 = path.join(__dirname, 'test-avatar-1.png')
    const testImagePath2 = path.join(__dirname, 'test-avatar-2.png')
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    )
    fs.writeFileSync(testImagePath1, testImageBuffer)
    fs.writeFileSync(testImagePath2, testImageBuffer)

    // Upload first avatar
    const response1 = await request(app.server)
      .patch('/users/avatar')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', testImagePath1)

    expect(response1.statusCode).toBe(200)
    const firstAvatarUrl = response1.body.avatarUrl

    // Upload second avatar
    const response2 = await request(app.server)
      .patch('/users/avatar')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', testImagePath2)

    expect(response2.statusCode).toBe(200)
    const secondAvatarUrl = response2.body.avatarUrl

    // Avatars should be different
    expect(firstAvatarUrl).not.toBe(secondAvatarUrl)

    // Clean up test files
    if (fs.existsSync(testImagePath1)) {
      fs.unlinkSync(testImagePath1)
    }
    if (fs.existsSync(testImagePath2)) {
      fs.unlinkSync(testImagePath2)
    }
  })

  test('should not be able to update avatar without authentication', async () => {
    const testImagePath = path.join(__dirname, 'test-no-auth.png')
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    )
    fs.writeFileSync(testImagePath, testImageBuffer)

    const response = await request(app.server)
      .patch('/users/avatar')
      .attach('file', testImagePath)

    expect(response.statusCode).toBe(401)

    // Clean up test file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath)
    }
  })

  test('should not be able to update avatar with invalid token', async () => {
    const testImagePath = path.join(__dirname, 'test-invalid-token.png')
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    )
    fs.writeFileSync(testImagePath, testImageBuffer)

    const response = await request(app.server)
      .patch('/users/avatar')
      .set('Authorization', 'Bearer invalid-token')
      .attach('file', testImagePath)

    expect(response.statusCode).toBe(401)

    // Clean up test file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath)
    }
  })

  test('should not be able to update avatar without sending file', async () => {
    // Create a user
    await request(app.server).post('/users').send({
      name: 'No File User',
      email: 'nofile@example.com',
      password: '123456',
      gender: 'MALE',
    })

    // Authenticate
    const authResponse = await request(app.server).post('/users/login').send({
      email: 'nofile@example.com',
      password: '123456',
    })

    const token = authResponse.body.access_token

    // Try to update without file
    const response = await request(app.server)
      .patch('/users/avatar')
      .set('Authorization', `Bearer ${token}`)
      .field('dummy', 'value') // Send empty form to trigger multipart parsing

    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('message', 'Nenhum arquivo enviado.')
  })

  test('should return updated avatar URL in user data', async () => {
    // Create a user
    await request(app.server).post('/users').send({
      name: 'Check Avatar User',
      email: 'checkavatar@example.com',
      password: '123456',
      gender: 'MALE',
    })

    // Authenticate
    const authResponse = await request(app.server).post('/users/login').send({
      email: 'checkavatar@example.com',
      password: '123456',
    })

    const token = authResponse.body.access_token

    // Create test image
    const testImagePath = path.join(__dirname, 'test-check-avatar.png')
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    )
    fs.writeFileSync(testImagePath, testImageBuffer)

    // Upload avatar
    const uploadResponse = await request(app.server)
      .patch('/users/avatar')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', testImagePath)

    const avatarUrl = uploadResponse.body.avatarUrl

    // Get user data
    const userDataResponse = await request(app.server)
      .get('/users/data')
      .set('Authorization', `Bearer ${token}`)

    expect(userDataResponse.statusCode).toBe(200)
    expect(userDataResponse.body.user.avatar_url).toBe(avatarUrl)

    // Clean up test file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath)
    }
  })
})
