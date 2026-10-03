'use client'

import { useId, type ReactNode } from 'react'
import { Badge, Button, ListState } from '@/shared/ui'
import { TEXT } from '@/shared/config'

interface DraftSectionProps {
  title: string
  count: number
  isPending: boolean
  isError: boolean
  onRetry: () => void
  loadingText: string
  errorText: string
  emptyText: string
  children: ReactNode
}

// [refactored] 분양글·게시글 섹션이 두 벌 갖던 제목·개수 + 목록 상태 골격
const DraftSection = ({
  title,
  count,
  isPending,
  isError,
  onRetry,
  loadingText,
  errorText,
  emptyText,
  children,
}: DraftSectionProps) => {
  const titleId = useId()

  return (
    <section aria-labelledby={titleId}>
      <div className="mb-4 flex items-center gap-2 tab:mb-5">
        <h2 id={titleId} className={TEXT.section}>
          {title}
        </h2>
        {!isPending && !isError && <Badge variant="pointCount">{count}</Badge>}
      </div>

      <ListState
        isPending={isPending}
        isError={isError}
        isEmpty={count === 0}
        loadingText={loadingText}
        errorText={errorText}
        emptyText={emptyText}
        errorAction={
          <Button intent="dark" size="sm" onClick={onRetry}>
            다시 시도
          </Button>
        }
      >
        {children}
      </ListState>
    </section>
  )
}

export { DraftSection }
