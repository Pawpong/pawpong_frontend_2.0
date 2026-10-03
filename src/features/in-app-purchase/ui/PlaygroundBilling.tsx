'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { iapApi, type IapProduct, type IapPlatform } from '@/entities/iap'
import { nativeIap, type NativeIapProduct } from '@/shared/lib/nativeIap'
import { Button, buttonVariants } from '@/shared/ui'
import { PLAYGROUND_BILLING_ENABLED } from '@/shared/config/playground'
import { usePurchases } from './PurchaseProvider'
import { loadStoreProducts, purchaseOptions } from '../model/storeProducts'

const date = (value: string) => new Date(value).toLocaleDateString('ko-KR')
const statusLabels = {
  pending: '승인 대기',
  verified: '결제 확인',
  refunded: '환불',
  expired: '기간 만료',
  canceled: '갱신 해지',
  on_hold: '결제 보류',
}

function ProductCard({
  product,
  store,
  platform,
  busy,
  onPurchase,
}: {
  product: IapProduct
  store?: NativeIapProduct
  platform: IapPlatform
  busy: boolean
  onPurchase: (product: IapProduct, offerToken?: string) => void
}) {
  const options = store ? purchaseOptions(store, platform) : []
  const [selected, setSelected] = useState('')
  const option = options.find((item) => item.key === selected) ?? options[0]
  return (
    <article className="flex flex-col rounded-xl border border-neutral-200 bg-white p-5">
      <p className="text-xs font-semibold text-primary-700">
        {product.type === 'subscription'
          ? '정기 이용권'
          : product.type === 'consumable'
            ? '이용권 충전'
            : '일회 구매'}
      </p>
      <h3 className="mt-2 text-lg font-bold text-neutral-850">{product.name}</h3>
      {product.benefits
        .filter((b) => b.type === 'credits')
        .map((benefit) => (
          <p key={benefit.creditKey} className="mt-1 text-sm text-neutral-700">
            {benefit.creditKey === 'playground' ? '놀이터 ' : ''}이용권{' '}
            {benefit.quantity.toLocaleString()}개
            {product.type === 'subscription' ? ' / 결제 주기' : ''}
          </p>
        ))}
      {store?.description && (
        <p className="mt-2 text-sm leading-relaxed text-neutral-700">{store.description}</p>
      )}
      {options.length > 1 && (
        <fieldset className="mt-3 space-y-2">
          <legend className="mb-2 text-sm font-semibold">요금제 선택</legend>
          {options.map((item) => (
            <label
              key={item.key}
              className="flex items-start gap-2 rounded-lg border border-neutral-200 p-3 text-sm"
            >
              <input
                type="radio"
                name={`plan-${product.code}`}
                checked={option?.key === item.key}
                onChange={() => setSelected(item.key)}
                disabled={busy}
              />
              <span>
                {item.price}
                <small className="mt-1 block">{item.terms}</small>
              </span>
            </label>
          ))}
        </fieldset>
      )}
      <div className="mt-auto pt-5">
        {option ? (
          <>
            <p className="text-lg font-bold text-neutral-850">{option.price}</p>
            <p className="mt-1 text-xs leading-relaxed text-neutral-700">{option.terms}</p>
          </>
        ) : (
          <p className="text-sm text-neutral-700">스토어에서 판매 조건을 확인할 수 없어요.</p>
        )}
        <div className="mt-4">
          <Button
            width="full"
            disabled={busy || !option}
            onClick={() => onPurchase(product, option?.offerToken)}
          >
            {product.type === 'subscription' ? '구독하기' : '구매하기'}
          </Button>
        </div>
      </div>
    </article>
  )
}

export function PlaygroundBilling() {
  return PLAYGROUND_BILLING_ENABLED ? <EnabledPlaygroundBilling /> : null
}

function EnabledPlaygroundBilling() {
  const billing = usePurchases()
  const { platform, memberId, account, busy, notice, recover, refresh } = billing
  useEffect(() => {
    void refresh()
    const recovery = setTimeout(() => void recover(), 0)
    return () => clearTimeout(recovery)
  }, [recover, refresh])
  const [page, setPage] = useState(1)
  const [managementError, setManagementError] = useState('')
  const catalog = useQuery({
    queryKey: ['iap', 'catalog', platform],
    queryFn: ({ signal }) => iapApi.products(platform!, signal),
    enabled: Boolean(platform),
    staleTime: 30_000,
    retry: 1,
    throwOnError: false,
  })
  const store = useQuery({
    queryKey: ['iap', 'store', platform, catalog.data],
    queryFn: ({ signal }) => loadStoreProducts(catalog.data!, platform!, signal),
    enabled: Boolean(platform && catalog.data),
    staleTime: 30_000,
    retry: false,
    throwOnError: false,
    gcTime: 0,
  })
  const history = useQuery({
    queryKey: ['iap', 'member', memberId, billing.generation, 'history', page],
    queryFn: ({ signal }) => iapApi.purchases(page, signal),
    enabled: Boolean(memberId),
    staleTime: 15_000,
    retry: 1,
    throwOnError: false,
  })
  const refreshProducts = () => {
    void catalog.refetch()
    void store.refetch()
  }

  return (
    <div className="space-y-8">
      <section
        aria-labelledby="playground-wallet"
        className="rounded-2xl border border-neutral-200 p-5 tab:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="playground-wallet" className="text-xl font-bold text-neutral-850">
            내 이용권
          </h2>
          {memberId && (
            <Button
              intent="link"
              size="sm"
              onClick={() => void billing.refresh()}
              disabled={busy || account.isFetching}
            >
              새로고침
            </Button>
          )}
        </div>
        {!memberId ? (
          <div className="mt-4">
            <p className="mb-3 text-sm text-neutral-700">
              로그인하면 이용권과 구매 내역을 확인할 수 있어요.
            </p>
            <Link className={buttonVariants({ size: 'md' })} href="/login?returnUrl=%2Fplayground">
              로그인하기
            </Link>
          </div>
        ) : account.isError ? (
          <p role="alert" className="mt-4 text-sm text-error-500">
            이용권을 불러오지 못했어요. 새로고침해 주세요.
          </p>
        ) : !account.data ? (
          <p className="mt-4 text-sm text-neutral-700">이용권을 확인하고 있어요…</p>
        ) : (
          <>
            <div className="mt-4 grid gap-3 tab:grid-cols-2">
              {account.data.creditBalances.length ? (
                account.data.creditBalances.map((balance) => (
                  <div key={balance.creditKey} className="rounded-xl bg-neutral-50 p-4">
                    <p className="text-sm font-semibold">
                      {balance.creditKey === 'playground' ? '놀이터 이용권' : '보유 이용권'}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-primary-700">
                      {balance.available.toLocaleString()}개
                    </p>
                    <p className="mt-2 text-xs text-neutral-700">
                      구독 잔여 {balance.subscriptionRemaining}개 · 충전 잔여{' '}
                      {balance.topUpRemaining}개
                    </p>
                    {balance.debt > 0 && (
                      <p className="mt-2 text-xs text-neutral-700">
                        환불 정산 {balance.debt}개가 잔액에 반영되어 있어요.
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-700">보유한 유료 이용권이 없어요.</p>
              )}
            </div>
            {account.data.features
              .filter((f) => f.featureKey === 'ai_image')
              .map((feature) => (
                <p className="mt-4 text-sm text-neutral-700" key={feature.featureKey}>
                  AI 사진 오늘 무료 {feature.freeRemaining}회 / {feature.dailyFreeLimit}회 · 한국
                  시간 자정에 새로 받아요.
                </p>
              ))}
            {account.data.entitlements.some((e) => e.active && e.expiresAt && e.remaining > 0) && (
              <ul className="mt-3 space-y-1 text-xs text-neutral-700">
                {account.data.entitlements
                  .filter((e) => e.active && e.expiresAt && e.remaining > 0)
                  .map((e) => (
                    <li key={e.id}>
                      구독 이용권 {e.remaining}개 · {date(e.expiresAt!)}까지
                    </li>
                  ))}
              </ul>
            )}
          </>
        )}
        <p className="mt-4 text-xs leading-relaxed text-neutral-700">
          무료 횟수, 만료가 가까운 구독 이용권, 충전 이용권 순서로 사용해요. 구독 이용권은 결제
          기간이 끝나면 만료되고, 충전 이용권에는 만료일이 없어요.
        </p>
      </section>

      <section aria-labelledby="playground-products">
        <h2 id="playground-products" className="text-xl font-bold text-neutral-850">
          이용권 충전과 구독
        </h2>
        {notice && (
          <p role="status" className="mt-4 rounded-xl bg-point-50 p-4 text-sm leading-relaxed">
            {notice}
          </p>
        )}
        {!platform ? (
          <p className="mt-4 rounded-xl bg-neutral-50 p-5 text-sm text-neutral-700">
            충전과 구독은 결제를 지원하는 최신 포퐁 앱에서 이용할 수 있어요.
          </p>
        ) : catalog.isError || store.isError ? (
          <div className="mt-4" role="alert">
            <p className="mb-3 text-sm text-error-500">스토어 상품을 불러오지 못했어요.</p>
            <Button intent="secondary" onClick={refreshProducts}>
              다시 불러오기
            </Button>
          </div>
        ) : catalog.isPending || store.isPending ? (
          <p className="mt-4 text-sm text-neutral-700">스토어 가격을 확인하고 있어요…</p>
        ) : !catalog.data?.length ? (
          <p className="mt-4 rounded-xl bg-neutral-50 p-5 text-sm text-neutral-700">
            판매 중인 이용권이 없어요. 상품이 준비되면 여기에서 확인할 수 있어요.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 tab:grid-cols-2">
            {catalog.data.map((product) => (
              <ProductCard
                key={product.code}
                product={product}
                platform={platform}
                store={store.data?.find((p) => p.id === product.storeProductIds[platform])}
                busy={busy || !memberId || !account.data || account.isError}
                onPurchase={(p, offer) => void billing.purchase(p, offer)}
              />
            ))}
          </div>
        )}
        {platform && (
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              intent="secondary"
              disabled={busy || !memberId}
              onClick={() => void billing.recover(true)}
            >
              구매 복원
            </Button>
            <Button
              intent="link"
              disabled={busy}
              onClick={() => {
                setManagementError('')
                void nativeIap
                  .manageSubscriptions()
                  .catch(() =>
                    setManagementError(
                      '구독 관리 화면을 열지 못했어요. 기기의 스토어 설정에서 확인해 주세요.',
                    ),
                  )
              }}
            >
              구독 관리
            </Button>
          </div>
        )}
        {busy && (
          <p role="status" className="mt-3 text-sm text-neutral-700">
            결제를 확인하고 있어요…
          </p>
        )}
        {managementError && (
          <p role="alert" className="mt-3 text-sm text-error-500">
            {managementError}
          </p>
        )}
        <p className="mt-4 text-xs leading-relaxed text-neutral-700">
          구독은 스토어 설정에서 해지할 수 있으며, 해지해도 이미 결제한 기간은 유지돼요. 스토어
          할인과 최종 결제 조건은 결제창에서 확인해 주세요.{' '}
          <Link href="/terms-of-service" className="underline">
            이용약관
          </Link>{' '}
          ·{' '}
          <Link href="/terms-of-privacy" className="underline">
            개인정보처리방침
          </Link>
        </p>
      </section>

      {memberId && (
        <section aria-labelledby="playground-history">
          <h2 id="playground-history" className="text-xl font-bold text-neutral-850">
            구매 내역
          </h2>
          {history.isError ? (
            <div role="alert" className="mt-4">
              <p className="text-sm text-error-500">구매 내역을 불러오지 못했어요.</p>
              <Button intent="link" onClick={() => void history.refetch()}>
                다시 확인
              </Button>
            </div>
          ) : !history.data ? (
            <p className="mt-4 text-sm">내역을 확인하고 있어요…</p>
          ) : (
            <>
              {history.data.items.length ? (
                <ul className="mt-4 divide-y divide-neutral-200">
                  {history.data.items.map((purchase) => (
                    <li key={purchase.id} className="py-4">
                      <div className="flex justify-between gap-3">
                        <span className="font-semibold">
                          {catalog.data?.find((p) => p.code === purchase.productCode)?.name ??
                            (purchase.type === 'subscription' ? '정기 이용권' : '이용권 구매')}
                        </span>
                        <span className="text-sm text-neutral-700">
                          {statusLabels[purchase.status]}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-700">
                        {date(purchase.purchasedAt)} ·{' '}
                        {purchase.platform === 'ios' ? 'App Store' : 'Google Play'}
                        {purchase.environment === 'Sandbox' ? ' · 테스트 결제' : ''}
                      </p>
                      {purchase.expiresAt && (
                        <p className="mt-1 text-xs text-neutral-700">
                          결제 기간 종료 {date(purchase.expiresAt)}
                          {purchase.autoRenewing === false ? ' · 자동 갱신 꺼짐' : ''}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-neutral-700">아직 구매 내역이 없어요.</p>
              )}
              {history.data.pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-4">
                  <Button intent="link" disabled={page === 1} onClick={() => setPage(page - 1)}>
                    이전
                  </Button>
                  <span className="text-sm text-neutral-700">
                    {page} / {history.data.pagination.totalPages}
                  </span>
                  <Button
                    intent="link"
                    disabled={page >= history.data.pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    다음
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  )
}
