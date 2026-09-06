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
    let scheduledFrame: number | null = null

    const recoverActiveQueries = (framesUntilRecovery = 1) => {
      if (scheduledFrame !== null) window.cancelAnimationFrame(scheduledFrame)

      const schedule = (remainingFrames: number) => {
        scheduledFrame = window.requestAnimationFrame(() => {
          if (remainingFrames > 1) {
            schedule(remainingFrames - 1)
            return
          }

          scheduledFrame = null
          // resetQueries가 진행 중 요청 취소와 active query 재요청을 원자적으로 처리한다.
          // 먼저 cancelQueries를 호출하면 라우트 구독 교체 시점에 reset 대상이 사라져
          // 복원 화면이 pending 상태로 남을 수 있다.
          void queryClient.resetQueries({ type: 'active' }, { cancelRefetch: true })
        })
      }

      schedule(framesUntilRecovery)
    }

    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return
      recoverActiveQueries()
    }

    const handlePopState = () => {
      // Next.js 클라이언트 히스토리 탐색은 pageshow 없이 popstate만 발생한다.
      // 새 route segment가 active query를 구독한 뒤 재시작하도록 두 프레임을 기다린다.
      recoverActiveQueries(2)
    }

    const navigation = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined

    // BFCache 복원은 기존 listener가 pageshow를 받고, 문서 자체가 다시 로드된
    // back/forward 탐색은 effect가 pageshow 이후 붙으므로 navigation type으로 보완한다.
    if (navigation?.type === 'back_forward') recoverActiveQueries()

    window.addEventListener('pageshow', handlePageShow)
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('pageshow', handlePageShow)
      window.removeEventListener('popstate', handlePopState)
      if (scheduledFrame !== null) window.cancelAnimationFrame(scheduledFrame)
    }
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
