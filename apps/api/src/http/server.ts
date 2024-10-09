import FastifyCors from '@fastify/cors'
import FastifyJWT from '@fastify/jwt'
import FastifySwagger from '@fastify/swagger'
import FastifySwaggerUI from '@fastify/swagger-ui'
import { env } from '@saas/env'
import { fastify } from 'fastify'
import * as ZodProvider from 'fastify-type-provider-zod'

import { authWithGithub } from './routes/auth/auth-with-github'
import { authWithPassword } from './routes/auth/auth-with-password'
import { signup } from './routes/auth/create-account'
import { getProfile } from './routes/auth/get-profile'
import { requestPasswordRecover } from './routes/auth/request-password-recover'
import { resetPassword } from './routes/auth/reset-password'
import { errorHandler } from './routes/error-handler.error'

const app = fastify().withTypeProvider<ZodProvider.ZodTypeProvider>()

app.setSerializerCompiler(ZodProvider.serializerCompiler)
app.setValidatorCompiler(ZodProvider.validatorCompiler)

app.setErrorHandler(errorHandler)

app.register(FastifySwagger, {
  openapi: {
    info: {
      title: 'nextjs-saas-rbac',
      description:
        'Fullstack multi-tenant SaaS boilerplate with Next.js, Prisma, and RBAC',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: ZodProvider.jsonSchemaTransform,
})
app.register(FastifySwaggerUI, {
  routePrefix: '/docs',
})
app.register(FastifyJWT, {
  secret: env.JWT_SCRET,
})

app.register(FastifyCors)
app.register(signup)
app.register(authWithPassword)
app.register(authWithGithub)
app.register(getProfile)
app.register(requestPasswordRecover)
app.register(resetPassword)

app.listen({ port: env.SERVER_PORT }).then(() => {
  console.log('Server is running on port 3333')
})
