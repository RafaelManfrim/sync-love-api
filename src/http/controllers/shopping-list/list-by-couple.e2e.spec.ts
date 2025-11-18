import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { createCouple } from '@/utils/create-test-couple'

describe('List Shopping Lists (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('should be able to list all shopping lists of a couple', async () => {
    const { token1, token2 } = await createCouple('shopping-lists')

    // Create shopping lists
    await request(app.server)
      .post('/shopping-lists')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        title: 'Weekly Groceries',
      })

    await request(app.server)
      .post('/shopping-lists')
      .set('Authorization', `Bearer ${token2}`)
      .send({
        title: 'Monthly Shopping',
      })

    // List shopping lists
    const response = await request(app.server)
      .get('/shopping-lists')
      .set('Authorization', `Bearer ${token1}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.shoppingLists).toHaveLength(2)
    expect(response.body.shoppingLists[0]).toHaveProperty('name')
    expect(response.body.shoppingLists[0]).toHaveProperty('author_id')
    expect(response.body.shoppingLists[0]).toHaveProperty('couple_id')
    expect(response.body.shoppingLists[0]).toHaveProperty('closed_at')
    expect(response.body.shoppingLists[0]).toHaveProperty('created_at')
  })

  test('should return empty array if couple has no shopping lists', async () => {
    const { token1 } = await createCouple('shopping-lists-empty')

    const response = await request(app.server)
      .get('/shopping-lists')
      .set('Authorization', `Bearer ${token1}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.shoppingLists).toHaveLength(0)
  })

  test('should not be able to list shopping lists without authentication', async () => {
    const response = await request(app.server).get('/shopping-lists')

    expect(response.statusCode).toBe(401)
  })

  test('should not be able to list shopping lists with invalid token', async () => {
    const response = await request(app.server)
      .get('/shopping-lists')
      .set('Authorization', 'Bearer invalid-token')

    expect(response.statusCode).toBe(401)
  })

  test('should only list shopping lists from user couple', async () => {
    const { token1: token1a } = await createCouple('shopping-lists-1')

    const { token1: token2a } = await createCouple('shopping-lists-2')

    // Couple 1 creates shopping list
    await request(app.server)
      .post('/shopping-lists')
      .set('Authorization', `Bearer ${token1a}`)
      .send({
        title: 'Couple 1 List',
      })

    // Couple 2 creates shopping list
    await request(app.server)
      .post('/shopping-lists')
      .set('Authorization', `Bearer ${token2a}`)
      .send({
        title: 'Couple 2 List',
      })

    // Couple 1 lists - should see only their list
    const response1 = await request(app.server)
      .get('/shopping-lists')
      .set('Authorization', `Bearer ${token1a}`)

    console.log(response1.body)

    expect(response1.statusCode).toBe(200)
    expect(response1.body.shoppingLists).toHaveLength(1)
    expect(response1.body.shoppingLists[0].name).toBe('Couple 1 List')

    // Couple 2 lists - should see only their list
    const response2 = await request(app.server)
      .get('/shopping-lists')
      .set('Authorization', `Bearer ${token2a}`)

    expect(response2.statusCode).toBe(200)
    expect(response2.body.shoppingLists).toHaveLength(1)
    expect(response2.body.shoppingLists[0].name).toBe('Couple 2 List')
  })
})
