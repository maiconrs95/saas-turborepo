import { definyAbilityFor } from '@saas/auth'

const ability = definyAbilityFor({ role: 'MEMBER' })

console.log(ability.can('invite', 'User'))
console.log(ability.can('delete', 'User'))
console.log(ability.cannot('delete', 'User'))
