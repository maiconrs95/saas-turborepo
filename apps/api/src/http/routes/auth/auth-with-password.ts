import { compare } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { type ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

import BadRequestError from '../_errors/bad-request.error'

export async function signin(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/signin/password',
    {
      schema: {
        tags: ['auth'],
        summary: 'Sing in with user email & passowrd',
        body: z.object({
          email: z.string().email(),
          password: z.string(),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (req, rep) => {
      const { email, password } = req.body
      const userFromEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (!userFromEmail) {
        throw new BadRequestError('Invalid credentials.')
      }

      if (userFromEmail.passwordHash === null) {
        throw new BadRequestError(
          'User does not have a password, use social login.',
        )
      }

      const isPasswordValid = await compare(
        password,
        userFromEmail.passwordHash,
      )

      if (!isPasswordValid) {
        throw new BadRequestError('Invalid credentials.')
      }

      const token = await rep.jwtSign(
        {
          sub: userFromEmail.id,
        },
        {
          expiresIn: '7d',
        },
      )

      return rep.status(201).send({ token })
    },
  )
}
