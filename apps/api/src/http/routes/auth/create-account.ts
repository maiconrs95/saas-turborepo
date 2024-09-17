import { hash } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { type ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

export async function signup(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        tags: ['auth'],
        summary: 'Create new account',
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          password: z.string().min(6),
        }),
      },
    },
    async (req, rep) => {
      const { name, email, password } = req.body
      const userWithSameEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (userWithSameEmail) {
        return rep.status(400).send({ message: 'Email already in use' })
      }

      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: await hash(password, 6),
        },
      })

      return rep.status(201).send(user)
    },
  )
}
