import { z } from 'zod'

import { roleSchema } from '../roles'

export const userSchema = z.object({
  id: z.string(),
  role: roleSchema.or(z.array(roleSchema)),
})

export type User = z.infer<typeof userSchema>
