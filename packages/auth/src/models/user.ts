import { z } from 'zod'

import { Role, roleSchmema } from '../roles'

export const userSchema = z.object({
  role: roleSchmema,
})

export type User = {
  role: Role
}
