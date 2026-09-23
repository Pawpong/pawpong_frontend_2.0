'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { needsDocumentReload, recoverPageError } from '@/shared/lib/pageErrorRecovery'
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
  title = '문제가 발생했습니다',
  description = '페이지를 불러오는 중 오류가 발생했습니다.',
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
          죄송합니다. {description}
          <br />
          잠시 후 다시 시도해주세요.
        </p>
      }
      actions={
        <>
          <Button
            onClick={() => recoverPageError(error, reset, () => window.location.reload())}
            size="lg"
            className="w-full px-5"
          >
            {reloadRequired ? '페이지 새로 불러오기' : '다시 시도'}
          </Button>
          <Button
            onClick={() => window.location.assign('/')}
            variant="outline"
            size="lg"
            className="w-full px-5 hover:bg-neutral-50"
          >
            홈으로 가기
          </Button>
        </>
      }
    />
  )
}
