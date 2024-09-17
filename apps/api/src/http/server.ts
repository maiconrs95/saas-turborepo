import FastifyCors from '@fastify/cors'
import Swagger from '@fastify/swagger'
import SwaggerUI from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import * as ZodProvider from 'fastify-type-provider-zod'

import { signup } from './routes/auth/create-account'

const app = fastify().withTypeProvider<ZodProvider.ZodTypeProvider>()

app.setSerializerCompiler(ZodProvider.serializerCompiler)
app.setValidatorCompiler(ZodProvider.validatorCompiler)

app.register(Swagger, {
  openapi: {
    info: {
      title: 'nextjs-saas-rbac',
      description:
        'Fullstack multi-tenant SaaS boilerplate with Next.js, Prisma, and RBAC',
      version: '1.0.0',
    },
    servers: [],
  },
  transform: ZodProvider.jsonSchemaTransform,
})
app.register(SwaggerUI, {
  routePrefix: '/docs',
})

app.register(FastifyCors)
app.register(signup)

app.listen({ port: 3333 }).then(() => {
  console.log('Server is running on port 3333')
})
