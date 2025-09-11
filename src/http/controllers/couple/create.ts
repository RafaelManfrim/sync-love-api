import { FastifyReply, FastifyRequest } from 'fastify'

export async function createCouple(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.status(501).send({ message: 'Not implemented' })
}
