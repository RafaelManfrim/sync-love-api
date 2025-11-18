import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { createCouple } from '@/utils/create-test-couple'

describe('Get Couple Details (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('should be able to get couple details', async () => {
    const { token1 } = await createCouple('details')

    // Get couple details
    const response = await request(app.server)
      .get('/couples/details')
      .set('Authorization', `Bearer ${token1}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.coupleDetails).toBeDefined()
    expect(response.body.coupleDetails).toHaveProperty('partner')
    expect(response.body.coupleDetails).toHaveProperty('togetherSince')
    expect(response.body.coupleDetails).toHaveProperty('listsCreated')
    expect(response.body.coupleDetails).toHaveProperty('totalTasksCreated')
    expect(response.body.coupleDetails).toHaveProperty('taskCompletionSummary')
    expect(response.body.coupleDetails).toHaveProperty(
      'totalCalendarEventsCreated',
    )
  })

  test('should return 404 when user is not in a couple', async () => {
    // Create single user
    await request(app.server).post('/users').send({
      name: 'Single User',
      email: 'single-user-details@example.com',
      password: '123456',
      gender: 'MALE',
    })

    const auth = await request(app.server).post('/users/login').send({
      email: 'single-user-details@example.com',
      password: '123456',
    })

    const token = auth.body.access_token

    // Try to get couple details
    const response = await request(app.server)
      .get('/couples/details')
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(404)
  })

  test('should not be able to get couple details without authentication', async () => {
    const response = await request(app.server).get('/couples/details')

    expect(response.statusCode).toBe(401)
  })

  test('should not be able to get couple details with invalid token', async () => {
    const response = await request(app.server)
      .get('/couples/details')
      .set('Authorization', 'Bearer invalid-token')

    expect(response.statusCode).toBe(401)
  })

  test('should get correct couple details for both users in the relationship', async () => {
    const { token1, token2 } = await createCouple('details-both-users')

    // Get couple details from user 1
    const response1 = await request(app.server)
      .get('/couples/details')
      .set('Authorization', `Bearer ${token1}`)

    // Get couple details from user 2
    const response2 = await request(app.server)
      .get('/couples/details')
      .set('Authorization', `Bearer ${token2}`)

    // Both should get the same couple details
    expect(response1.statusCode).toBe(200)
    expect(response2.statusCode).toBe(200)
    expect(response1.body.coupleDetails.togetherSince).toBe(
      response2.body.coupleDetails.togetherSince,
    )
    expect(response1.body.coupleDetails.listsCreated).toBe(
      response2.body.coupleDetails.listsCreated,
    )
  })
})
