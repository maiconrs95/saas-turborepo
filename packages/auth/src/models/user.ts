import { z } from 'zod'

import { roleSchmema } from '../roles'

export const userSchema = z.object({
  id: z.string(),
  role: roleSchmema,
})

export type User = z.infer<typeof userSchema>
