import { AbilityBuilder } from '@casl/ability'

import { AppAbility } from '.'
import { User } from './models/user'
import { Role } from './roles'

type PermissionByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void

export const permissions: Record<Role, PermissionByRole> = {
  ADMIN(_, builder) {
    builder.can('manage', 'all')
  },
  MEMBER(user, builder) {
    builder.can(['create', 'get'], 'Project')
    builder.can(['update', 'delete'], 'Project', {
      ownerId: {
        $eq: user.id,
      },
    })
  },
  BILLING() {},
}
