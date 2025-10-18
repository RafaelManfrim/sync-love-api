import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import { resolve } from 'node:path'

import { env } from './env'
import { appRoutes } from './http/routes/routes'

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

  return reply.status(500).send({ message: 'Internal server error.' })
})

export { app }
