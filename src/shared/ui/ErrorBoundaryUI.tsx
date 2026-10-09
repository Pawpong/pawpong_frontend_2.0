'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { needsDocumentReload, recoverPageError } from '@/shared/lib/pageErrorRecovery'
import { RetryButton } from './RetryButton'
import { Button } from './Button'
import { FullPageMessage } from './FullPageMessage'

interface ErrorBoundaryUIProps {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
  description?: string
}

export function ErrorBoundaryUI({
  error,
  reset,
  title = '문제가 생겼어요',
  description = '페이지를 불러오지 못했어요.',
}: ErrorBoundaryUIProps) {
  const reloadRequired = needsDocumentReload(error)

  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <FullPageMessage
      badge="잠시 쉬어갈게요"
      title={title}
      description={
        <p>
          {description}
          <br />
          잠시 후 다시 시도해 주세요.
        </p>
      }
      actions={
        <>
          {reloadRequired ? (
            <Button
              onClick={() => recoverPageError(error, reset, () => window.location.reload())}
              size="lg"
              width="full"
            >
              페이지 새로 불러오기
            </Button>
          ) : (
            <RetryButton
              onRetry={() => recoverPageError(error, reset, () => window.location.reload())}
            />
          )}
          <Button
            onClick={() => window.location.assign('/')}
            intent="secondary"
            size="lg"
            width="full"
          >
            홈으로 가기
          </Button>
        </>
      }
    />
  )
}
