import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authMiddleware } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import slug from '@/utils/slug'

import BadRequestError from '../_errors/bad-request.error'

export async function createOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .post(
      '/organization',
      {
        schema: {
          tags: ['organizations'],
          security: [
            {
              bearerAuth: [],
            },
          ],
          summary: 'Create a new organization',
          body: z.object({
            name: z.string(),
            domain: z.string().nullish(),
            shouldAttachUsersByDomain: z.boolean().optional(),
          }),
          response: {
            201: z.object({
              organizationId: z.string(),
            }),
          },
        },
      },
      async (req, rep) => {
        const userId = await req.getCurrentUserId()
        const { name, domain, shouldAttachUsersByDomain } = req.body

        if (domain) {
          const existingOrganization = await prisma.organization.findFirst({
            where: {
              domain,
            },
          })

          if (existingOrganization) {
            throw new BadRequestError(
              'Organization with this domain already exists.',
            )
          }
        }

        const organization = await prisma.organization.create({
          data: {
            name,
            domain,
            slug: slug.createSlug(name),
            shouldAttachUsersByDomain,
            ownerId: userId,
            members: {
              create: {
                userId,
                role: 'ADMIN',
              },
            },
          },
        })

        return rep.status(201).send({
          organizationId: organization.id,
        })
      },
    )
}
