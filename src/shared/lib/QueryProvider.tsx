'use client'

import * as Sentry from '@sentry/nextjs'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApiError, STALE_TIME, isApiError } from '@/shared/api'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

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

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
