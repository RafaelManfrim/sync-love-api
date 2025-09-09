import { FastifyReply, FastifyRequest } from 'fastify'

export async function invitePartner(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.status(501).send({ message: 'Not implemented' })
}
