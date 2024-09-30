import { hash } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { type ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

import BadRequestError from '../_errors/bad-request.error'

export async function signup(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/signup',
    {
      schema: {
        tags: ['auth'],
        summary: 'Sing up and create a new account',
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
        throw new BadRequestError('Email already in use.')
      }

      const domain = email.split('@')[1]

      const autoJointOrganization = await prisma.organization.findFirst({
        where: {
          domain,
          shouldAttachUsersByDomain: true,
        },
      })

      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: await hash(password, 6),
          member_on: autoJointOrganization
            ? {
                create: {
                  organizationId: autoJointOrganization.id,
                  role: 'MEMBER',
                },
              }
            : undefined,
        },
      })

      return rep.status(201).send(user)
    },
  )
}
