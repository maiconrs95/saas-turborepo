import { AbilityBuilder } from '@casl/ability'

import { AppAbility } from '.'
import { User } from './models/user'

type PermissionByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void

type Role = 'ADMIN' | 'MEMBER'

export const permissions: Record<Role, PermissionByRole> = {
  ADMIN(_, builder) {
    builder.can('manage', 'all')
  },
  MEMBER(_, builder) {
    builder.can('invite', 'User')
  },
}
