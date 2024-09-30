import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'

import BadRequestError from './_errors/bad-request.error'
import UnauthorizedError from './_errors/unauthorized.error'

type FastifyErrorHandler = FastifyInstance['errorHandler']

// log this error with observability tools
export const errorHandler: FastifyErrorHandler = (error, req, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error',
      errors: error.flatten().fieldErrors,
    })
  }

  if (error instanceof BadRequestError) {
    return reply.status(400).send({
      message: error.message,
    })
  }

  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({
      message: error.message,
    })
  }

  return reply.status(500).send({
    messsage: 'Internal server error',
  })
}
