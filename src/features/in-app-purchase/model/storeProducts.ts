import type { IapProduct, IapPlatform } from '@/entities/iap'
import { nativeIap, type NativeIapProduct } from '@/shared/lib/nativeIap'

export async function loadStoreProducts(
  catalog: IapProduct[],
  platform: IapPlatform,
  signal?: AbortSignal,
) {
  const products: NativeIapProduct[] = []
  for (const type of ['in-app', 'subs'] as const) {
    const ids = catalog
      .filter(
        (p) =>
          p.active &&
          p.saleEnabled &&
          !p.archived &&
          p.storeRegistered[platform] &&
          (p.type === 'subscription' ? 'subs' : 'in-app') === type,
      )
      .flatMap((p) => (p.storeProductIds[platform] ? [p.storeProductIds[platform]!] : []))
    for (let offset = 0; offset < ids.length; offset += 50) {
      products.push(...(await nativeIap.products(ids.slice(offset, offset + 50), type, signal)))
    }
  }
  return products
}

export function periodLabel(period: string): string | null {
  const match = /^P([1-9]\d{0,3})([DWMY])$/.exec(period)
  if (!match) return null
  const unit: Record<string, string> = { D: '일', W: '주', M: '개월', Y: '년' }
  return `${match[1]}${unit[match[2]]}`
}
export function purchaseOptions(product: NativeIapProduct, platform: IapPlatform) {
  if (product.type !== 'subs')
    return [
      {
        key: product.id,
        price: product.displayPrice,
        terms: '한 번 결제',
        offerToken: undefined as string | undefined,
      },
    ]
  if (platform === 'ios') {
    const period = periodLabel(product.subscriptionPeriod ?? '')
    return period
      ? [
          {
            key: product.id,
            price: `${product.displayPrice} / ${period}`,
            terms: '자동 갱신 구독 · 해지 전까지 결제 주기마다 갱신돼요.',
            offerToken: undefined as string | undefined,
          },
        ]
      : []
  }
  return (product.subscriptionOffers ?? []).flatMap((offer) => {
    if (
      offer.phases.some(
        (phase) => !periodLabel(phase.period) || ![1, 2, 3].includes(phase.recurrenceMode),
      )
    )
      return []
    const last = offer.phases.at(-1)!
    const stages = offer.phases.map(
      (phase) =>
        `${phase.displayPrice} / ${periodLabel(phase.period)}${phase.recurrenceMode === 2 ? ` (${phase.cycles}회)` : ''}`,
    )
    return [
      {
        key: offer.offerToken,
        price: stages.join(' → '),
        terms:
          last.recurrenceMode === 1
            ? '자동 갱신 구독 · 해지 전까지 갱신돼요.'
            : '선불 이용권 · 결제한 기간에 이용할 수 있어요.',
        offerToken: offer.offerToken,
      },
    ]
  })
}
