'use client'

import { ROUTE_ERROR_MESSAGES, RouteErrorView } from '@/widgets/route-error'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ko">
      <body className="flex min-h-screen items-center justify-center px-4">
        <RouteErrorView error={error} reset={reset} {...ROUTE_ERROR_MESSAGES.global} />
      </body>
    </html>
  )
}
