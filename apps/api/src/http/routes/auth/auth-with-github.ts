// import { compare } from 'bcryptjs'
import { env } from '@saas/env'
import { FastifyInstance } from 'fastify'
import { type ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

import BadRequestError from '../_errors/bad-request.error'

export async function authWithGithub(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/auth/github',
    {
      schema: {
        tags: ['auth'],
        summary: 'Sing in with user github',
        body: z.object({
          code: z.string(),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (req, rep) => {
      const { code } = req.body

      const githubOAuthURL = new URL(
        'https://github.com/login/oauth/access_token',
      )

      // add env here
      githubOAuthURL.searchParams.set('client_id', env.GITHUB_OAUTH_CLIENT_ID)
      githubOAuthURL.searchParams.set(
        'client_secret',
        env.GITHUB_OAUTH_CLIENT_SECRET,
      )
      githubOAuthURL.searchParams.set(
        'redirect_uri',
        env.GITHUB_OAUTH_CLIENT_REDIRECT_URL,
      )
      githubOAuthURL.searchParams.set('code', code)

      const response = await fetch(githubOAuthURL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      }).then((res) => res.json())

      const { access_token: githubAccesToken } = z
        .object({
          access_token: z.string(),
          token_type: z.literal('bearer'),
          scope: z.string(),
        })
        .parse(response)

      const gitHubUser = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${githubAccesToken}`,
        },
      }).then((res) => res.json())

      console.log(gitHubUser)

      const {
        id: githubUserId,
        name,
        email,
        avatar_url: avatarUrl,
      } = z
        .object({
          id: z.number().int().transform(String),
          avatar_url: z.string().url(),
          name: z.string().nullable(),
          email: z.string().email().nullable(),
        })
        .parse(gitHubUser)

      if (email === null) {
        throw new BadRequestError('Email not provided by github.')
      }

      let user = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name,
            avatarURL: avatarUrl,
          },
        })

        let account = await prisma.account.findUnique({
          where: {
            provider_userId: {
              provider: 'GITHUB',
              userId: user.id,
            },
          },
        })

        if (!account) {
          account = await prisma.account.create({
            data: {
              provider: 'GITHUB',
              providerAccountId: githubUserId,
              userId: user.id,
            },
          })
        }

        const token = await rep.jwtSign(
          {
            sub: user.id,
          },
          {
            expiresIn: '7d',
          },
        )

        return rep.status(201).send({ token })
      }
    },
  )
}
