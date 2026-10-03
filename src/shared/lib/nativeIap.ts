import { z } from 'zod'
import { PLAYGROUND_BILLING_ENABLED } from '../config/playground'
import { requestNative } from './nativeBridge'

const productId = z.string().regex(/^[A-Za-z0-9._-]{1,100}$/)
const transactionId = z.string().regex(/^[\w.:-]{1,256}$/)
const productType = z.enum(['in-app', 'subs'])
const productSchema = z.object({
  id: productId,
  type: productType,
  title: z.string(),
  description: z.string(),
  displayPrice: z.string().min(1),
  price: z.number().finite().nullable(),
  currency: z.string().min(1),
  offerTokens: z.array(z.string().min(1).max(2048)).optional(),
  subscriptionPeriod: z.string().optional(),
  subscriptionOffers: z
    .array(
      z.object({
        offerToken: z.string().min(1).max(2048),
        basePlanId: z.string().min(1),
        phases: z
          .array(
            z.object({
              displayPrice: z.string().min(1),
              period: z.string(),
              cycles: z.number().int().nonnegative(),
              recurrenceMode: z.number().int(),
            }),
          )
          .min(1),
      }),
    )
    .optional(),
})
const purchaseSchema = z.object({
  transactionId,
  productId,
  purchaseToken: z.string().min(1).max(262144).nullable(),
  state: z.enum(['purchased', 'pending', 'unknown']),
  transactionDate: z.number().finite(),
  platform: z.enum(['ios', 'android']),
})
export type NativeIapProduct = z.infer<typeof productSchema>
export type NativeIapPurchase = z.infer<typeof purchaseSchema>
export type NativeIapOutcome =
  | { status: 'cancelled' }
  | { status: 'purchased' | 'pending'; purchase: NativeIapPurchase }

const failureMessages: Record<string, string> = {
  busy: '이미 결제창이 열려 있어요. 진행 중인 결제를 먼저 마쳐 주세요.',
  'already-owned': '이미 보유한 상품이에요. 구매 복원을 눌러 확인해 주세요.',
  'not-available': '지금은 이 상품을 구매할 수 없어요.',
}
function assertReply(reply: Record<string, unknown>, status: string) {
  if (reply.status !== status)
    throw new Error(
      failureMessages[String(reply.code)] ?? '스토어 응답을 확인하지 못했어요. 다시 시도해 주세요.',
    )
}
function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value)
  // 영수증이 포함된 ZodError를 로깅 도구나 UI에 전달하지 않는다.
  if (!result.success) throw new Error('스토어에서 올바른 결제 정보를 받지 못했어요.')
  return result.data
}
const request = (
  type: string,
  response: string,
  payload: Record<string, unknown>,
  signal?: AbortSignal,
  timeout = 30_000,
) => requestNative('inAppPurchase', type, response, payload, timeout, signal)

export const nativeIap = {
  products: async (ids: string[], type: 'in-app' | 'subs', signal?: AbortSignal) => {
    const productIds = parse(z.array(productId).min(1).max(50), ids)
    const reply = await request(
      'IAP_GET_PRODUCTS',
      'IAP_PRODUCTS_RESULT',
      { productIds, productType: type },
      signal,
    )
    assertReply(reply, 'ok')
    return parse(z.array(productSchema), reply.products).filter(
      (p) => ids.includes(p.id) && p.type === type,
    )
  },
  purchase: async (
    input: {
      productId: string
      productType: 'in-app' | 'subs'
      accountToken: string
      offerToken?: string
    },
    signal?: AbortSignal,
  ): Promise<NativeIapOutcome> => {
    // 화면을 우회해 호출해도 출시 전에는 네이티브 구매 메시지를 보내지 않는다.
    if (!PLAYGROUND_BILLING_ENABLED) throw new Error('지금은 결제를 이용할 수 없어요.')
    const payload = parse(
      z.object({
        productId,
        productType,
        accountToken: z.string().uuid(),
        offerToken: z.string().min(1).max(2048).optional(),
      }),
      input,
    )
    const reply = await request('IAP_PURCHASE', 'IAP_PURCHASE_RESULT', payload, signal, 11 * 60_000)
    if (reply.status === 'cancelled') return { status: 'cancelled' }
    if (reply.status !== 'pending' && reply.status !== 'purchased') assertReply(reply, 'purchased')
    const purchase = parse(purchaseSchema, reply.purchase)
    if (purchase.productId !== input.productId || purchase.state !== reply.status)
      throw new Error('요청한 상품과 결제 결과가 일치하지 않아요. 구매 복원으로 확인해 주세요.')
    return { status: reply.status as 'pending' | 'purchased', purchase }
  },
  purchases: async (restore = false, signal?: AbortSignal) => {
    const reply = await request(
      restore ? 'IAP_RESTORE' : 'IAP_GET_PENDING',
      'IAP_PURCHASES_RESULT',
      {},
      signal,
    )
    assertReply(reply, 'ok')
    return parse(z.array(purchaseSchema), reply.purchases)
  },
  finish: async (id: string, consumable: boolean, signal?: AbortSignal) => {
    const reply = await request(
      'IAP_FINISH',
      'IAP_FINISH_RESULT',
      { transactionId: parse(transactionId, id), consumable },
      signal,
    )
    assertReply(reply, 'finished')
  },
  manageSubscriptions: async () => {
    const reply = await request('IAP_MANAGE_SUBSCRIPTIONS', 'IAP_MANAGE_SUBSCRIPTIONS_RESULT', {})
    assertReply(reply, 'opened')
  },
}
