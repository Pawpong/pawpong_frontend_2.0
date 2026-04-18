'use client'

import { ROUTE_ERROR_MESSAGES, RouteErrorView } from '@/widgets/route-error'

export default function SignupError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <RouteErrorView error={error} reset={reset} {...ROUTE_ERROR_MESSAGES.signup} />
}
