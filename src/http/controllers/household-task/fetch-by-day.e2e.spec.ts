import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { createCouple } from '@/utils/create-test-couple'

describe('Fetch Tasks By Day (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('should be able to fetch tasks for a specific day', async () => {
    const { token1 } = await createCouple('fetch-by-day')

    // Create a task
    await request(app.server)
      .post('/tasks')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        title: 'Clean the house',
        description: 'Deep cleaning',
        startDate: '2025-11-18',
      })

    // Fetch tasks for the day
    const response = await request(app.server)
      .get('/tasks/by-day?date=2025-11-18')
      .set('Authorization', `Bearer ${token1}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.tasks).toBeInstanceOf(Array)
    expect(response.body.tasks.length).toBeGreaterThan(0)
    expect(response.body.tasks[0]).toHaveProperty('id')
    expect(response.body.tasks[0]).toHaveProperty('title')
    expect(response.body.tasks[0]).toHaveProperty('description')
  })

  test('should return empty array for day with no tasks', async () => {
    const { token1 } = await createCouple('fetch-by-day-empty')

    // Fetch tasks for a day without tasks
    const response = await request(app.server)
      .get('/tasks/by-day?date=2025-12-25')
      .set('Authorization', `Bearer ${token1}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.tasks).toHaveLength(0)
  })

  test('should not be able to fetch tasks without authentication', async () => {
    const response = await request(app.server).get(
      '/tasks/by-day?date=2025-11-18',
    )

    expect(response.statusCode).toBe(401)
  })

  test('should not be able to fetch tasks with invalid token', async () => {
    const response = await request(app.server)
      .get('/tasks/by-day?date=2025-11-18')
      .set('Authorization', 'Bearer invalid-token')

    expect(response.statusCode).toBe(401)
  })

  test('should return 400 if date parameter is missing', async () => {
    const { token1 } = await createCouple('fetch-by-day-missing-date')

    // Fetch without date parameter
    const response = await request(app.server)
      .get('/tasks/by-day')
      .set('Authorization', `Bearer ${token1}`)

    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR')
  })

  test('should handle recurring tasks', async () => {
    const { token1 } = await createCouple('fetch-by-day-recurring')

    // Create recurring task (daily) - usando formato ISO completo
    await request(app.server)
      .post('/tasks')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        title: 'Daily Task',
        description: 'Do this every day',
        startDate: '2025-11-18T00:00:00.000Z',
        recurrenceRule: 'FREQ=DAILY',
      })
      .expect(201)

    // Fetch tasks for the start date
    const response = await request(app.server)
      .get('/tasks/by-day?date=2025-11-18')
      .set('Authorization', `Bearer ${token1}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.tasks).toBeInstanceOf(Array)
    expect(response.body.tasks).toHaveLength(1)
    expect(response.body.tasks[0].title).toBe('Daily Task')

    // Fetch tasks for the next day (should also appear due to recurrence)
    const nextDayResponse = await request(app.server)
      .get('/tasks/by-day?date=2025-11-19')
      .set('Authorization', `Bearer ${token1}`)

    expect(nextDayResponse.statusCode).toBe(200)
    expect(nextDayResponse.body.tasks).toBeInstanceOf(Array)
    expect(nextDayResponse.body.tasks).toHaveLength(1)
  })
})
