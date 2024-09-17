import { compare } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { type ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

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
      },
    },
    async (req, rep) => {
      const { email, password } = req.body
      const userFromEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (!userFromEmail) {
        return rep.status(400).send({ message: 'Invalid credetials' })
      }

      if (userFromEmail.passwordHash === null) {
        return rep
          .status(400)
          .send({ message: 'User does not have a password. Use social login.' })
      }

      const isPasswordValid = await compare(
        password,
        userFromEmail.passwordHash,
      )

      if (!isPasswordValid) {
        return rep.status(400).send({ message: 'Invalid credetials' })
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
