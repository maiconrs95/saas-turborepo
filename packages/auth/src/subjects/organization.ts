import { z } from 'zod'

import { organizationSchema } from '../models/organizationt'

export const organizationSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('create'),
    z.literal('update'),
    z.literal('delete'),
    z.literal('transfer_ownership'),
  ]),
  z.union([z.literal('Organiazation'), organizationSchema]),
])

export type OrganizationSubject = z.infer<typeof organizationSubject>
