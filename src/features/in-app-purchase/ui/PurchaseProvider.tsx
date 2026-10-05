'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { iapApi, type IapProduct } from '@/entities/iap'
import { getAccessToken, ApiError } from '@/shared/api'
import { PLAYGROUND_BILLING_ENABLED } from '@/shared/config/playground'
import { getAuthSessionGeneration, isAuthSessionCurrent } from '@/shared/lib/authSessionLifecycle'
import {
  getNativePlatform,
  hasNativeCapability,
  subscribeNativeCapabilities,
} from '@/shared/lib/nativeBridge'
import { nativeIap, type NativeIapPurchase } from '@/shared/lib/nativeIap'
import { settlePurchase } from '../model/settlePurchase'

const nativePlatform = () => (hasNativeCapability('inAppPurchase') ? getNativePlatform() : null)
const noPlatform = () => null

function failureMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return '로그인 정보를 다시 확인한 뒤 구매 복원을 눌러 주세요.'
    if (error.status === 403) return '결제한 포퐁 계정으로 로그인한 뒤 구매 복원을 눌러 주세요.'
    if (error.status === 503)
      return '지금은 결제를 확인할 수 없어요. 다시 결제하지 말고 잠시 후 구매 복원을 눌러 주세요.'
    return '결제를 확인하지 못했어요. 다시 결제하지 말고 구매 복원을 눌러 주세요.'
  }
  return error instanceof Error
    ? error.message
    : '결제를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.'
}

function usePurchaseController(memberId: string | null, generation: number) {
  const platform = useSyncExternalStore(subscribeNativeCapabilities, nativePlatform, noPlatform)
  const client = useQueryClient()
  const key = ['iap', 'member', memberId, generation] as const
  const account = useQuery({
    queryKey: [...key, 'account'],
    queryFn: ({ signal }) => iapApi.account(signal),
    enabled: Boolean(memberId),
    staleTime: 15_000,
    retry: 1,
    throwOnError: false,
    refetchOnWindowFocus: true,
  })
  const scope = useMemo(() => ({ memberId, generation }), [memberId, generation])
  const [view, setView] = useState({ scope, busy: false, notice: '' })
  const busy = view.scope === scope && view.busy
  const notice = view.scope === scope ? view.notice : ''
  const setBusy = useCallback(
    (value: boolean) =>
      setView((previous) => ({
        scope,
        busy: value,
        notice: previous.scope === scope ? previous.notice : '',
      })),
    [scope],
  )
  const setNotice = useCallback(
    (value: string) =>
      setView((previous) => ({
        scope,
        busy: previous.scope === scope && previous.busy,
        notice: value,
      })),
    [scope],
  )
  const busyRef = useRef(false)
  const lifetime = useRef<{ controller: AbortController; scope: typeof scope } | null>(null)
  useLayoutEffect(() => {
    const controller = new AbortController()
    lifetime.current = { controller, scope }
    busyRef.current = false
    return () => controller.abort()
  }, [scope])

  const refresh = useCallback(async () => {
    await client.invalidateQueries({ queryKey: ['iap', 'member', memberId, generation] })
  }, [client, memberId, generation])

  const isScopeCurrent = useCallback(() => {
    const owner = lifetime.current
    return Boolean(
      owner?.scope === scope &&
      !owner.controller.signal.aborted &&
      isAuthSessionCurrent(generation),
    )
  }, [scope, generation])

  const session = useCallback(
    (requireToken = true) => {
      const owner = lifetime.current
      const signal = owner?.controller.signal
      const token = getAccessToken()
      const isCurrent = () =>
        Boolean(
          memberId &&
          owner &&
          owner.scope === scope &&
          lifetime.current === owner &&
          signal &&
          !signal.aborted &&
          isAuthSessionCurrent(generation),
        )
      if (!isCurrent() || (requireToken && !token)) throw new Error('로그인 후 다시 확인해 주세요.')
      return {
        signal,
        isCurrent,
        verify: (purchase: NativeIapPurchase) => {
          if (!isCurrent() || !token || purchase.platform !== platform)
            throw new Error('결제 계정과 기기 정보를 다시 확인해 주세요.')
          return iapApi.verify(purchase, token, signal)
        },
        finish: (id: string, consumable: boolean) => nativeIap.finish(id, consumable, signal),
      }
    },
    [memberId, generation, platform, scope],
  )

  const recover = useCallback(
    async (restore = false) => {
      if (!memberId || !platform || !account.data?.accountToken || busyRef.current) return
      let current: ReturnType<typeof session> | undefined
      try {
        current = session()
        busyRef.current = true
        setBusy(true)
        const purchases = await nativeIap.purchases(restore, current.signal)
        let checked = 0
        let waiting = 0
        let failed = 0
        // 한 거래가 다른 계정에 속하더라도 나머지 정상 거래의 복구를 계속한다.
        const seen = new Set<string>()
        for (const purchase of purchases) {
          if (!current.isCurrent()) return
          const id = `${purchase.platform}:${purchase.transactionId}`
          if (seen.has(id)) continue
          seen.add(id)
          try {
            const result = await settlePurchase(purchase, current)
            if (result === 'finished') checked++
            else waiting++
          } catch {
            failed++
          }
        }
        if (current.isCurrent()) {
          if (failed)
            setNotice(
              '일부 구매를 확인하지 못했어요. 결제한 계정인지 확인하고 구매 복원을 다시 눌러 주세요.',
            )
          else if (waiting)
            setNotice(
              '승인 또는 처리를 기다리는 결제가 있어요. 완료되면 이용권을 확인할 수 있어요.',
            )
          else if (restore)
            setNotice(
              checked
                ? '구매 확인을 마쳤어요. 이용권 내역을 확인해 주세요.'
                : '복원할 구매가 없어요. 소모성 이용권은 아래 계정 잔액에서 확인해 주세요.',
            )
          await refresh()
        }
      } catch (error) {
        if (current ? current.isCurrent() : isScopeCurrent()) setNotice(failureMessage(error))
      } finally {
        if (current?.isCurrent()) {
          busyRef.current = false
          setBusy(false)
        }
      }
    },
    [
      memberId,
      platform,
      account.data?.accountToken,
      session,
      refresh,
      setBusy,
      setNotice,
      isScopeCurrent,
    ],
  )

  useEffect(() => {
    if (!memberId) return
    // 예약을 취소할 수 있게 해 StrictMode 재마운트에서 네이티브 복구를 중복 시작하지 않는다.
    const initialRecovery = setTimeout(() => void recover(), 0)
    const onActive = () => {
      void refresh()
      void recover()
    }
    window.addEventListener('pawpong:app-active', onActive)
    return () => {
      clearTimeout(initialRecovery)
      window.removeEventListener('pawpong:app-active', onActive)
    }
  }, [memberId, recover, refresh])

  const purchase = async (product: IapProduct, offerToken?: string) => {
    if (!PLAYGROUND_BILLING_ENABLED) {
      setNotice('지금은 결제를 이용할 수 없어요.')
      return
    }
    if (busyRef.current || !platform || !memberId) return
    let current: ReturnType<typeof session> | undefined
    try {
      current = session(false)
      busyRef.current = true
      setBusy(true)
      setNotice('')
      // 결제 직전에 회원 토큰과 판매 상태를 다시 읽어 오래 열린 화면의 변경도 반영한다.
      const fresh = await account.refetch()
      if (!current.isCurrent()) return
      if (fresh.error || !fresh.data)
        throw new Error('이용권 계정을 확인하지 못했어요. 잠시 후 다시 시도해 주세요.')
      // 계정 재조회가 만료된 토큰을 갱신할 수 있다. 같은 세션인지 확인한 후 새 토큰을 고정한다.
      current = session()
      const catalog = await iapApi.products(platform, current.signal)
      const available = catalog.find(
        (p) =>
          p.code === product.code &&
          p.type === product.type &&
          p.storeProductIds[platform] === product.storeProductIds[platform],
      )
      if (!current.isCurrent()) return
      if (available && JSON.stringify(available.benefits) !== JSON.stringify(product.benefits))
        throw new Error('상품의 지급 혜택이 변경됐어요. 목록을 새로 확인해 주세요.')
      if (
        !available?.active ||
        !available.saleEnabled ||
        available.archived ||
        !available.storeRegistered[platform]
      )
        throw new Error('판매가 중지된 상품이에요. 목록을 새로 확인해 주세요.')
      const productId = available.storeProductIds[platform]!
      const outcome = await nativeIap.purchase(
        {
          productId,
          productType: available.type === 'subscription' ? 'subs' : 'in-app',
          accountToken: fresh.data.accountToken,
          offerToken,
        },
        current.signal,
      )
      if (!current.isCurrent() || outcome.status === 'cancelled') return
      const result = await settlePurchase(outcome.purchase, current)
      if (!current.isCurrent()) return
      setNotice(
        result === 'finished'
          ? '구매 확인을 마쳤어요. 이용권 내역을 확인해 주세요.'
          : result === 'finish-pending'
            ? '이용권 지급을 확인했어요. 스토어 처리 상태는 다음 접속에서 다시 확인할게요.'
            : '승인 또는 결제 확인을 기다리고 있어요. 다시 결제하지 않아도 돼요.',
      )
      await refresh()
    } catch (error) {
      if (current ? current.isCurrent() : isScopeCurrent()) setNotice(failureMessage(error))
    } finally {
      if (current?.isCurrent()) {
        busyRef.current = false
        setBusy(false)
      }
    }
  }

  return { account, platform, busy, notice, purchase, recover, refresh, memberId, generation }
}

const PurchaseContext = createContext<ReturnType<typeof usePurchaseController> | null>(null)
export function PurchaseProvider({
  memberId,
  children,
}: {
  memberId: string | null
  children: ReactNode
}) {
  const generation = getAuthSessionGeneration()
  const value = usePurchaseController(memberId, generation)
  // 결제 작업만 세션별로 취소한다. 프로필 재조회가 작성 중인 페이지를 언마운트하면 안 된다.
  return <PurchaseContext value={value}>{children}</PurchaseContext>
}
export function usePurchases() {
  const context = useContext(PurchaseContext)
  if (!context) throw new Error('PurchaseProvider is required')
  return context
}
