import FastifyCors from '@fastify/cors'
import { fastify } from 'fastify'
import * as ZodProvider from 'fastify-type-provider-zod'

import { createAccount } from './routes/auth/create-account'

const app = fastify().withTypeProvider<ZodProvider.ZodTypeProvider>()

app.setSerializerCompiler(ZodProvider.serializerCompiler)
app.setValidatorCompiler(ZodProvider.validatorCompiler)
app.register(FastifyCors)

app.register(createAccount)

app.listen({ port: 3333 }).then(() => {
  console.log('Server is running on port 3333')
})
