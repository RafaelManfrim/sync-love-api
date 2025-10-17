import { FastifyReply, FastifyRequest } from 'fastify'

export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    console.log(request.headers)
    await request.jwtVerify()
  } catch (err) {
    reply.code(401).send({ message: 'Não autorizado' })
  }
}
