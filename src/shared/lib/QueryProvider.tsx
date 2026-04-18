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
  if (!isApiError(error)) return true
  return error.status === undefined || error.status >= 500
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
