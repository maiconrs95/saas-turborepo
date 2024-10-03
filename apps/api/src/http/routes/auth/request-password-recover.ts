import { FastifyInstance } from 'fastify'
import { type ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

export async function requestPasswordRecover(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/password/recover',
    {
      schema: {
        tags: ['auth'],
        summary: 'Get authenticaded user profile',
        response: {
          201: z.null(),
        },
        body: z.object({
          email: z.string().email(),
        }),
      },
    },
    async (req, rep) => {
      const { email } = req.body

      const userFormEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (!userFormEmail) {
        return rep.status(201).send()
      }

      const { id } = await prisma.token.create({
        data: {
          type: 'PASSWORD_RECOVER',
          userId: userFormEmail.id,
        },
      })

      // send email with pass recover link
      console.log('Recover token', id)

      return rep.status(201).send()
    },
  )
}
