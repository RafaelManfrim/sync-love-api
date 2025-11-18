import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { createCouple } from '@/utils/create-test-couple'

describe('End Relationship (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  // test('should be able to end a relationship', async () => {
  //   const { token1 } = await createCouple('end-relationship')

  //   const response = await request(app.server)
  //     .delete('/couples/end')
  //     .set('Authorization', `Bearer ${token1}`)

  //   console.log(response)

  //   expect(response.statusCode).toBe(204)
  // })

  // test('should not be able to access couple details after ending relationship', async () => {
  //   const { token1 } = await createCouple('end-relationship-details')

  //   // Verify couple details exists
  //   const detailsBefore = await request(app.server)
  //     .get('/couples/details')
  //     .set('Authorization', `Bearer ${token1}`)

  //   expect(detailsBefore.statusCode).toBe(200)

  //   // End relationship
  //   await request(app.server)
  //     .delete('/couples/end')
  //     .set('Authorization', `Bearer ${token1}`)

  //   // Try to access couple details after ending
  //   const detailsAfter = await request(app.server)
  //     .get('/couples/details')
  //     .set('Authorization', `Bearer ${token1}`)

  //   expect(detailsAfter.statusCode).toBe(404)
  // })

  // test('should return 404 when trying to end a non-existent relationship', async () => {
  //   // Create single user
  //   await request(app.server).post('/users').send({
  //     name: 'Single End User',
  //     email: 'single-end-user@example.com',
  //     password: '123456',
  //     gender: 'MALE',
  //   })

  //   const auth = await request(app.server).post('/users/login').send({
  //     email: 'single-end-user@example.com',
  //     password: '123456',
  //   })

  //   const token = auth.body.access_token

  //   // Try to end relationship
  //   const response = await request(app.server)
  //     .delete('/couples/end')
  //     .set('Authorization', `Bearer ${token}`)

  //   expect(response.statusCode).toBe(404)
  // })

  // test('should not be able to end relationship without authentication', async () => {
  //   const response = await request(app.server).delete('/couples/end')

  //   expect(response.statusCode).toBe(401)
  // })

  // test('should not be able to end relationship with invalid token', async () => {
  //   const response = await request(app.server)
  //     .delete('/couples/end')
  //     .set('Authorization', 'Bearer invalid-token')

  //   expect(response.statusCode).toBe(401)
  // })

  // test('should affect both users when relationship is ended', async () => {
  //   const { token1, token2 } = await createCouple('end-relationship-both-users')

  //   // User 1 ends relationship
  //   const endResponse = await request(app.server)
  //     .delete('/couples/end')
  //     .set('Authorization', `Bearer ${token1}`)

  //   expect(endResponse.statusCode).toBe(204)

  //   // Both users should not have access to couple details anymore
  //   const details1 = await request(app.server)
  //     .get('/couples/details')
  //     .set('Authorization', `Bearer ${token1}`)

  //   const details2 = await request(app.server)
  //     .get('/couples/details')
  //     .set('Authorization', `Bearer ${token2}`)

  //   expect(details1.statusCode).toBe(404)
  //   expect(details2.statusCode).toBe(404)
  // })

  test('should delete couple data when relationship is ended', async () => {
    const { token1 } = await createCouple('end-relationship-delete-data')

    // Create shopping list
    await request(app.server)
      .post('/shopping-lists')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        title: 'Couple Shopping List',
      })

    // Verify shopping list exists
    const listsBefore = await request(app.server)
      .get('/shopping-lists')
      .set('Authorization', `Bearer ${token1}`)

    expect(listsBefore.statusCode).toBe(200)
    expect(listsBefore.body.shoppingLists).toHaveLength(1)

    // End relationship
    const resp = await request(app.server)
      .delete('/couples/end')
      .set('Authorization', `Bearer ${token1}`)

    expect(resp.statusCode).toBe(204)

    // Try to access shopping lists after ending (should fail because user has no couple)
    const listsAfter = await request(app.server)
      .get('/shopping-lists')
      .set('Authorization', `Bearer ${token1}`)

    expect(listsAfter.statusCode).toBe(404)
  })
})
