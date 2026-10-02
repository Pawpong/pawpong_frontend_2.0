import { z } from 'zod'
import { apiClient, API_VERSION, unwrap, type ApiRequestConfig } from '@/shared/api'
import type { ApiResponseFull } from '@/shared/types'
import type { NativeIapPurchase } from '@/shared/lib/nativeIap'
import {
  accountSchema,
  policySchema,
  productSchema,
  purchasePageSchema,
  verificationSchema,
  type IapPlatform,
} from '../model/types'

const base = `${API_VERSION}/iap`
function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value)
  if (!result.success)
    throw new Error('이용권 정보를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.')
  return result.data
}
async function read<T>(path: string, schema: z.ZodType<T>, signal?: AbortSignal) {
  const response = await apiClient.get<ApiResponseFull<unknown>>(`${base}${path}`, { signal })
  return parse(schema, unwrap(response, '이용권 정보를 불러오지 못했어요.'))
}
export const iapApi = {
  products: (platform: IapPlatform, signal?: AbortSignal) =>
    read(`/products?platform=${platform}`, z.array(productSchema), signal),
  policy: (signal?: AbortSignal) => read('/policy', policySchema, signal),
  account: (signal?: AbortSignal) => read('/account', accountSchema, signal),
  purchases: (page = 1, signal?: AbortSignal) =>
    read(`/purchases?page=${page}&limit=20`, purchasePageSchema, signal),
  verify: async (purchase: NativeIapPurchase, accessToken: string, signal?: AbortSignal) => {
    // 요청을 시작한 계정의 토큰을 고정한다. 401 후 다른 계정으로 결제 mutation을 재생하지 않는다.
    const config: ApiRequestConfig = {
      headers: { Authorization: `Bearer ${accessToken}` },
      skipAuthRefresh: true,
      signal,
    }
    const response = await apiClient.post<ApiResponseFull<unknown>>(
      `${base}/purchases/verify`,
      {
        platform: purchase.platform,
        productId: purchase.productId,
        purchaseToken: purchase.purchaseToken,
        transactionId: purchase.transactionId,
      },
      config,
    )
    return parse(
      verificationSchema,
      unwrap(response, '결제를 확인하지 못했어요. 구매 복원으로 다시 확인해 주세요.'),
    )
  },
}
