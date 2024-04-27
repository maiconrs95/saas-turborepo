import { z } from 'zod'

export const billingubject = z.tuple([
  z.union([z.literal('manage'), z.literal('get'), z.literal('export')]),
  z.literal('Billing'),
])

export type Billingubject = z.infer<typeof billingubject>
