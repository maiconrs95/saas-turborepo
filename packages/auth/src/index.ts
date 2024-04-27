import {
  AbilityBuilder,
  CreateAbility,
  createMongoAbility,
  MongoAbility,
} from '@casl/ability'
import { z } from 'zod'

import { User } from './models/user'
import { permissions } from './permissions'
import { Role } from './roles'
import { billingubject } from './subjects/billing'
import { inviteSubject } from './subjects/invite'
import { organizationSubject } from './subjects/organization'
import { projectSubject } from './subjects/project'
import { userSubject } from './subjects/user'

export * from './models/organization'
export * from './models/project'
export * from './models/user'

const appAbilitiesSchema = z.union([
  projectSubject,
  userSubject,
  organizationSubject,
  inviteSubject,
  billingubject,
  z.tuple([z.literal('manage'), z.literal('all')]),
])

type AppAbilities = z.infer<typeof appAbilitiesSchema>

export type AppAbility = MongoAbility<AppAbilities>
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>

export function definyAbilityFor(user: User) {
  const builder = new AbilityBuilder(createAppAbility)

  const build = (role: Role) => {
    if (typeof permissions[role] !== 'function') {
      throw new Error(`Permissions for role ${role} not found`)
    }
    return permissions[role](user, builder)
  }

  if (typeof user.role === 'string') {
    build(user.role)
  }

  if (Array.isArray(user.role)) {
    for (const role of user.role) {
      build(role)
    }
  }

  const ability = builder.build({
    detectSubjectType(subject) {
      return subject.__typename
    },
  })

  return ability
}
