import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import { resolve } from 'node:path'

import { env } from './env'
import { appRoutes } from './http/routes/routes'
import { AppError } from './use-cases/errors/app-error'

const app = Fastify({
  logger: true,
})

app.register(cors)

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(multipart)

app.register(fastifyStatic, {
  root: resolve(__dirname, '..', 'tmp'),
  prefix: '/tmp',
})

app.register(appRoutes)

app.setErrorHandler((error, _, reply) => {
  if (env.NODE_ENV !== 'production') {
    console.error(error)
  }

  if (error instanceof AppError) {
    return reply.status(400).send({
      message: error.message,
      code: error.code,
    })
  }

  return reply.status(500).send({
    message: 'Internal server error.',
    code: 'INTERNAL_SERVER_ERROR',
  })
})

export { app }
