import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { hash } from 'bcryptjs'
import { prisma } from '@lib/prisma'

export async function createUser(request: FastifyRequest, reply: FastifyReply) {
  const createUserBodySchema = z.object({
    name: z.string().nonempty(),
    email: z.string().email().nonempty(),
    password: z.string().min(6),
    gender: z.enum(['MALE', 'FEMALE']).default('MALE'),
  })

  const { email, name, password, gender } = createUserBodySchema.parse(
    request.body,
  )

  const passwordHash = await hash(password, 6)

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password_hash: passwordHash,
      gender,
    },
  })

  return reply.status(201).send(newUser)
}
