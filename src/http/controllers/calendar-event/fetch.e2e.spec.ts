import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { createCouple } from '@/utils/create-test-couple'

describe('Fetch Calendar Events (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('should be able to fetch calendar events in a date range', async () => {
    const { token1 } = await createCouple('fetch-range')

    // Create calendar event
    await request(app.server)
      .post('/calendar-events')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        title: 'Anniversary',
        description: 'Our anniversary',
        startTime: '2025-11-20',
        endTime: '2025-11-20',
      })

    // Fetch events in range
    const response = await request(app.server)
      .get('/calendar-events?startDate=2025-11-01&endDate=2025-11-30')
      .set('Authorization', `Bearer ${token1}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.events).toBeInstanceOf(Array)
    expect(response.body.events.length).toBeGreaterThan(0)
    expect(response.body.events[0]).toHaveProperty('id')
    expect(response.body.events[0]).toHaveProperty('title')
    expect(response.body.events[0]).toHaveProperty('occurrence_start_time')
    expect(response.body.events[0]).toHaveProperty('occurrence_end_time')
  })

  test('should return empty array for date range with no events', async () => {
    const { token1 } = await createCouple('empty-events')

    // Fetch events in range without events
    const response = await request(app.server)
      .get('/calendar-events?startDate=2026-01-01&endDate=2026-01-31')
      .set('Authorization', `Bearer ${token1}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.events).toHaveLength(0)
  })

  test('should not be able to fetch events without authentication', async () => {
    const response = await request(app.server).get(
      '/calendar-events?startDate=2025-11-01&endDate=2025-11-30',
    )

    expect(response.statusCode).toBe(401)
  })

  test('should not be able to fetch events with invalid token', async () => {
    const response = await request(app.server)
      .get('/calendar-events?startDate=2025-11-01&endDate=2025-11-30')
      .set('Authorization', 'Bearer invalid-token')

    expect(response.statusCode).toBe(401)
  })

  test('should return 400 if parameters are missing', async () => {
    const { token1 } = await createCouple('missing-params')

    // Fetch without startDate
    const response1 = await request(app.server)
      .get('/calendar-events?endDate=2025-11-30')
      .set('Authorization', `Bearer ${token1}`)

    // Fetch without endDate
    const response2 = await request(app.server)
      .get('/calendar-events?startDate=2025-11-01')
      .set('Authorization', `Bearer ${token1}`)

    expect(response1.statusCode).toBe(400)
    expect(response1.body).toHaveProperty('code', 'VALIDATION_ERROR')
    expect(response2.statusCode).toBe(400)
    expect(response2.body).toHaveProperty('code', 'VALIDATION_ERROR')
  })

  test('should include events on the end date (inclusive)', async () => {
    const { token1 } = await createCouple('inclusive-date')

    // Create event on the end date
    await request(app.server)
      .post('/calendar-events')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        title: 'End Date Event',
        description: 'Event on last day',
        startTime: '2025-11-30',
        endTime: '2025-11-30',
      })

    // Fetch events with range ending on that date
    const response = await request(app.server)
      .get('/calendar-events?startDate=2025-11-01&endDate=2025-11-30')
      .set('Authorization', `Bearer ${token1}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.events).toBeInstanceOf(Array)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const endDateEvent = response.body.events.find(
      (e: any) => e.title === 'End Date Event',
    )
    expect(endDateEvent).toBeDefined()
  })

  test('should only show events from the same couple', async () => {
    // Create first couple
    const { token1: token1User1 } = await createCouple('couple1-isolation')

    // Create second couple
    const { token1: token2User1 } = await createCouple('couple2-isolation')

    // Create event for first couple
    await request(app.server)
      .post('/calendar-events')
      .set('Authorization', `Bearer ${token1User1}`)
      .send({
        title: 'Couple 1 Event',
        description: 'First couple event',
        startTime: '2025-11-15',
        endTime: '2025-11-15',
      })

    // Create event for second couple
    await request(app.server)
      .post('/calendar-events')
      .set('Authorization', `Bearer ${token2User1}`)
      .send({
        title: 'Couple 2 Event',
        description: 'Second couple event',
        startTime: '2025-11-15',
        endTime: '2025-11-15',
      })

    // Fetch events for first couple
    const response1 = await request(app.server)
      .get('/calendar-events?startDate=2025-11-01&endDate=2025-11-30')
      .set('Authorization', `Bearer ${token1User1}`)

    expect(response1.statusCode).toBe(200)
    expect(response1.body.events).toBeInstanceOf(Array)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(
      response1.body.events.every((e: any) => e.title === 'Couple 1 Event'),
    ).toBe(true)

    // Fetch events for second couple
    const response2 = await request(app.server)
      .get('/calendar-events?startDate=2025-11-01&endDate=2025-11-30')
      .set('Authorization', `Bearer ${token2User1}`)

    expect(response2.statusCode).toBe(200)
    expect(response2.body.events).toBeInstanceOf(Array)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(
      response2.body.events.every((e: any) => e.title === 'Couple 2 Event'),
    ).toBe(true)
  })
})
