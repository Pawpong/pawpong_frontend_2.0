'use client'

import { useId, type ReactNode } from 'react'
import { Badge, ListState } from '@/shared/ui'
import { ListRowsSkeleton } from '@/shared/ui/Skeleton'
import { TEXT } from '@/shared/config'

interface DraftSectionProps {
  title: string
  count: number
  isPending: boolean
  isError: boolean
  onRetry: () => void
  isRetrying: boolean
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
  isRetrying,
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
        loadingFallback={<ListRowsSkeleton label={loadingText} rows={3} />}
        errorText={errorText}
        emptyText={emptyText}
        onRetry={onRetry}
        isRetrying={isRetrying}
      >
        {children}
      </ListState>
    </section>
  )
}

export { DraftSection }
