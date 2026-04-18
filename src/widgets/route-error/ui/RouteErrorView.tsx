'use client'

import { ErrorBoundaryUI } from '@/shared/ui'

export interface RouteErrorViewProps {
  error: Error & { digest?: string }
  reset: () => void
  title: string
  description: string
}

export function RouteErrorView({ error, reset, title, description }: RouteErrorViewProps) {
  return <ErrorBoundaryUI error={error} reset={reset} title={title} description={description} />
}
