import { FastifyInstance } from 'fastify'
import { type ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authMiddleware } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import BadRequestError from '../_errors/bad-request.error'

export async function getProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      '/profile',
      {
        schema: {
          tags: ['auth'],
          summary: 'Get authenticaded user profile',
          response: {
            200: z.object({
              user: z.object({
                id: z.string().uuid(),
                name: z.string().nullable(),
                email: z.string().email(),
                avatarURL: z.string().url().nullable(),
              }),
            }),
          },
        },
      },
      async (req, rep) => {
        const id = await req.getCurrentUserId()

        const user = await prisma.user.findUnique({
          select: {
            id: true,
            name: true,
            email: true,
            avatarURL: true,
          },
          where: {
            id,
          },
        })

        if (!user) {
          throw new BadRequestError('User not found.')
        }

        return rep.send({ user })
      },
    )
}
