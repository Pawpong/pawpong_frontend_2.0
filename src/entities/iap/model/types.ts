import { z } from 'zod'

export const platformSchema = z.enum(['ios', 'android'])
export const productTypeSchema = z.enum(['consumable', 'non_consumable', 'subscription'])
const nonNegative = z.number().int().nonnegative()
const benefitSchema = z.object({
  type: z.string(),
  creditKey: z.string().optional(),
  quantity: z.number().int().positive(),
})
export const productSchema = z.object({
  code: z.string(),
  name: z.string(),
  type: productTypeSchema,
  storeProductIds: z.object({ ios: z.string().optional(), android: z.string().optional() }),
  benefits: z.array(benefitSchema),
  active: z.boolean(),
  saleEnabled: z.boolean(),
  storeRegistered: z.object({ ios: z.boolean(), android: z.boolean() }),
  archived: z.boolean(),
})
const featureSchema = z.object({
  featureKey: z.string(),
  creditKey: z.string(),
  creditCost: z.number().int().positive(),
  dailyFreeLimit: nonNegative,
  enabled: z.boolean(),
})
export const policySchema = z.object({
  timezone: z.literal('Asia/Seoul'),
  consumptionOrder: z.array(z.string()),
  features: z.array(featureSchema),
  implementedFeatures: z.array(z.string()),
})
export const accountSchema = z.object({
  accountToken: z.string().uuid(),
  creditBalances: z.array(
    z.object({
      creditKey: z.string(),
      subscriptionRemaining: nonNegative,
      topUpRemaining: nonNegative,
      debt: nonNegative,
      available: nonNegative,
    }),
  ),
  features: z.array(
    featureSchema.extend({
      freeUsed: nonNegative,
      freeRemaining: nonNegative,
      resetAt: z.string(),
    }),
  ),
  entitlements: z.array(
    z.object({
      id: z.string(),
      purchaseId: z.string(),
      transactionId: z.string(),
      benefitType: z.string(),
      creditKey: z.string().optional(),
      source: productTypeSchema,
      quantity: nonNegative,
      remaining: z.number().int(),
      startsAt: z.string(),
      expiresAt: z.string().nullable(),
      active: z.boolean(),
    }),
  ),
})
export const purchaseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productCode: z.string(),
  productId: z.string(),
  platform: platformSchema,
  environment: z.enum(['Sandbox', 'Production']),
  type: productTypeSchema,
  transactionId: z.string(),
  originalTransactionId: z.string(),
  status: z.enum(['pending', 'verified', 'refunded', 'expired', 'canceled', 'on_hold']),
  benefits: z.array(benefitSchema),
  quantity: nonNegative,
  refundedQuantity: nonNegative,
  amount: z.string().nullable(),
  currency: z.string().nullable(),
  purchasedAt: z.string(),
  expiresAt: z.string().nullable(),
  autoRenewing: z.boolean().nullable(),
  acknowledged: z.boolean(),
  entitlementActive: z.boolean(),
  adminRevoked: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export const purchasePageSchema = z.object({
  items: z.array(purchaseSchema),
  pagination: z.object({
    currentPage: nonNegative,
    pageSize: nonNegative,
    totalItems: nonNegative,
    totalPages: nonNegative,
  }),
})
export const verificationSchema = z.object({
  purchase: purchaseSchema,
  finishable: z.boolean(),
  consumable: z.boolean(),
})
export type IapPlatform = z.infer<typeof platformSchema>
export type IapProduct = z.infer<typeof productSchema>
export type IapAccount = z.infer<typeof accountSchema>
export type IapPurchase = z.infer<typeof purchaseSchema>
export type IapPolicy = z.infer<typeof policySchema>

/** 잔액 계산은 서버가 수행한다. 화면은 서버가 준 available을 기능별 비용으로 표시한다. */
export function featureAllowance(account: IapAccount | undefined, featureKey: string) {
  const feature = account?.features.find((item) => item.featureKey === featureKey)
  if (!feature) return undefined
  const credits =
    account?.creditBalances.find((item) => item.creditKey === feature.creditKey)?.available ?? 0
  return {
    ...feature,
    credits,
    remaining: feature.enabled
      ? feature.freeRemaining + Math.floor(credits / feature.creditCost)
      : 0,
  }
}
