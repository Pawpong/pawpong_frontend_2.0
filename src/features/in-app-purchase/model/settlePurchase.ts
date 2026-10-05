import type { NativeIapPurchase } from '@/shared/lib/nativeIap'

export interface VerificationResult {
  finishable: boolean
  consumable: boolean
}
export interface PurchaseSession {
  isCurrent: () => boolean
  verify: (purchase: NativeIapPurchase) => Promise<VerificationResult>
  finish: (transactionId: string, consumable: boolean) => Promise<void>
}

/** 서버 지급 확인 뒤에만 종료한다. 중단된 거래는 RN의 미완료 목록에 남긴다. */
export async function settlePurchase(purchase: NativeIapPurchase, session: PurchaseSession) {
  if (!session.isCurrent())
    throw new Error('로그인 정보가 바뀌었어요. 현재 계정에서 다시 확인해 주세요.')
  if (purchase.state !== 'purchased') return 'pending' as const
  if (!purchase.purchaseToken)
    throw new Error('결제 영수증을 받지 못했어요. 구매 복원으로 다시 확인해 주세요.')
  const result = await session.verify(purchase)
  if (!session.isCurrent())
    throw new Error('로그인 정보가 바뀌었어요. 현재 계정에서 다시 확인해 주세요.')
  if (!result.finishable) return 'verifying' as const
  try {
    await session.finish(purchase.transactionId, result.consumable)
    return 'finished' as const
  } catch {
    // 서버 지급은 끝났다. 종료 재시도에서 다시 결제를 요구하지 않는다.
    return 'finish-pending' as const
  }
}
