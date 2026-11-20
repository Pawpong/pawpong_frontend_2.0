'use client'

import * as Sentry from '@sentry/nextjs'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApiError, STALE_TIME, isApiError } from '@/shared/api'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEffect, useState } from 'react'
import { AUTH_STATE_CHANGED } from './authStateEvents'
import { createAuthQueryBoundary } from './authQueryBoundary'
import { getTransientErrorRefetchInterval } from '../api/queryRecovery'

const shouldRetryRequest = (error: unknown, failureCount: number) => {
  if (isApiError(error) && error.request?.transportCode === 'ERR_CANCELED') return false
  if (isApiError(error) && error.status && [400, 401, 403, 404].includes(error.status)) {
    return false
  }

  return failureCount < 1
}

const shouldThrowToBoundary = (error: unknown) => {
  // API 장애는 사용자가 다시 시도할 수 있는 런타임 상태다. 페이지 전체 React 트리를
  // 걷어내는 error boundary는 렌더링/프로그래밍 오류에만 사용한다.
  if (!isApiError(error)) return true
  return false
}

const shouldCaptureError = (error: unknown): error is Error => {
  if (!(error instanceof Error)) return false
  if (!(error instanceof ApiError)) return true
  if (error.request?.transportCode === 'ERR_CANCELED') return false
  return error.status === undefined || error.status >= 500
}

const captureRequestError = (error: Error) => {
  if (error instanceof ApiError && error.request) {
    Sentry.captureException(error, {
      contexts: { api_request: { ...error.request, httpStatus: error.status } },
      // SDK의 기본 중복 제거도 서로 다른 API의 같은 메시지를 버리지 않게 한다.
      fingerprint: ['{{ default }}', error.request.method, error.request.endpoint],
    })
    return
  }
  Sentry.captureException(error)
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            if (!shouldThrowToBoundary(error) && shouldCaptureError(error)) {
              captureRequestError(error)
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            if (shouldCaptureError(error)) {
              captureRequestError(error)
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: STALE_TIME.DEFAULT,
            retry: (failureCount, error) => shouldRetryRequest(error, failureCount),
            throwOnError: (error) => shouldThrowToBoundary(error),
            // 일시 단절로 실패한 활성 조회는 재접속·화면 복귀·30초 주기로 복구한다.
            // 정상 캐시·4xx·취소 요청 및 변경 요청은 자동 재실행하지 않는다.
            refetchInterval: getTransientErrorRefetchInterval,
            refetchOnWindowFocus: (query) => getTransientErrorRefetchInterval(query) !== false,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  )

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const unsubscribe = queryClient.getMutationCache().subscribe((event) => {
      if (
        event.type !== 'updated' ||
        event.action.type !== 'success' ||
        event.mutation.options.mutationKey?.[0] === 'gamification'
      )
        return
      clearTimeout(timer)
      timer = setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: ['gamification', 'private'] })
        void queryClient.invalidateQueries({ queryKey: ['gamification', 'public'] })
      }, 1500)
    })
    return () => {
      unsubscribe()
      clearTimeout(timer)
    }
  }, [queryClient])

  useEffect(() => {
    const handleIdentityChange = createAuthQueryBoundary(queryClient)

    // BFCache 로 얼었다 풀린 문서는 진행 중이던 요청이 끝나지 않고 남을 수 있다.
    // cancelRefetch 가 그 요청을 끊고 다시 보내되, 보이던 데이터는 지우지 않는다.
    // 문서를 새로 불러온 뒤로가기는 QueryClient 도 새로 생겨 알아서 조회하고,
    // Next 클라이언트 뒤로가기는 refetchOnMount 가 맡으므로(신선한 캐시는 그대로, 오래된 것만 재조회) 여기서 다루지 않는다.
    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return
      void queryClient.refetchQueries({ type: 'active' }, { cancelRefetch: true })
    }

    const handleAppActive = () => {
      handleIdentityChange()
      void queryClient.refetchQueries(
        {
          type: 'active',
          predicate: (query) => getTransientErrorRefetchInterval(query) !== false,
        },
        { cancelRefetch: false },
      )
    }

    window.addEventListener('pageshow', handlePageShow)
    window.addEventListener('pawpong:app-active', handleAppActive)
    window.addEventListener(AUTH_STATE_CHANGED, handleIdentityChange)
    window.addEventListener('focus', handleIdentityChange)
    document.addEventListener('visibilitychange', handleIdentityChange)
    return () => {
      window.removeEventListener('pageshow', handlePageShow)
      window.removeEventListener('pawpong:app-active', handleAppActive)
      window.removeEventListener(AUTH_STATE_CHANGED, handleIdentityChange)
      window.removeEventListener('focus', handleIdentityChange)
      document.removeEventListener('visibilitychange', handleIdentityChange)
    }
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
