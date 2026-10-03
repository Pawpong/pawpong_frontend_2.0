'use client'

import { Button } from './Button'

export interface RetryButtonProps {
  onRetry: () => void
  isRetrying?: boolean
  /** 동작 대상을 보조 기술에 설명할 때 사용한다. */
  'aria-label'?: string
}

/** 재시도 버튼의 문구·크기·색상은 모든 화면에서 동일하다. */
export const RetryButton = ({
  onRetry,
  isRetrying = false,
  'aria-label': ariaLabel,
}: RetryButtonProps) => (
  <Button
    intent="dark"
    size="sm"
    disabled={isRetrying}
    aria-busy={isRetrying}
    aria-label={isRetrying ? '재시도 중' : ariaLabel}
    onClick={onRetry}
  >
    {isRetrying ? '재시도 중' : '다시 시도'}
  </Button>
)
