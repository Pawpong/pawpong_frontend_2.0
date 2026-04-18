'use client'

import * as Sentry from '@sentry/nextjs'
import Link from 'next/link'
import { useEffect } from 'react'

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
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <h2 className="mb-4 text-2xl font-bold text-grayscale-gray9">{title}</h2>
        <p className="mb-6 text-body-m text-grayscale-gray5">
          죄송합니다. {description}
          <br />
          잠시 후 다시 시도해주세요.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-primary px-6 py-3 text-white transition-opacity hover:opacity-90"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="rounded-lg border border-grayscale-gray3 px-6 py-3 text-grayscale-gray7 transition-colors hover:bg-grayscale-gray1"
          >
            홈으로 가기
          </Link>
        </div>
      </div>
    </div>
  )
}
