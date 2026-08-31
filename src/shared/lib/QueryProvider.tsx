'use client'

import * as Sentry from '@sentry/nextjs'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApiError, STALE_TIME, isApiError } from '@/shared/api'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEffect, useState } from 'react'

const shouldRetryRequest = (error: unknown, failureCount: number) => {
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

const shouldCaptureError = (error: unknown) => {
  if (!(error instanceof Error)) return false
  if (!(error instanceof ApiError)) return true
  return error.status === undefined || error.status >= 500
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            if (!shouldThrowToBoundary(error) && shouldCaptureError(error)) {
              Sentry.captureException(error)
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            if (shouldCaptureError(error)) {
              Sentry.captureException(error)
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: STALE_TIME.DEFAULT,
            retry: (failureCount, error) => shouldRetryRequest(error, failureCount),
            throwOnError: (error) => shouldThrowToBoundary(error),
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  )

  useEffect(() => {
    const recoverActiveQueries = () => {
      window.requestAnimationFrame(() => {
        // 중단된 retryer까지 초기화해야 back/forward 복원 뒤 동일 Promise를
        // 다시 붙잡지 않는다. resetQueries는 현재 화면의 active query만 재요청한다.
        void queryClient
          .cancelQueries({ type: 'active' })
          .then(() => queryClient.resetQueries({ type: 'active' }))
      })
    }

    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return
      recoverActiveQueries()
    }

    const navigation = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined

    // BFCache 복원은 기존 listener가 pageshow를 받고, 문서 자체가 다시 로드된
    // back/forward 탐색은 effect가 pageshow 이후 붙으므로 navigation type으로 보완한다.
    if (navigation?.type === 'back_forward') recoverActiveQueries()

    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
