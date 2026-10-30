import type { ReactNode } from 'react'
import { TEXT } from '@/shared/config'
import { RetryButton, AlertMessage, InfiniteScrollTrigger, ListState } from '@/shared/ui'
import { ListRowsSkeleton } from '@/shared/ui/Skeleton'

interface ActivityListLayoutProps {
  title: string
  description: string
  isPending: boolean
  isError: boolean
  isEmpty: boolean
  emptyText: string
  /** 빈 목록에서 다음 행동으로 잇는 버튼 */
  emptyAction?: ReactNode
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onRetry: () => void
  isRetrying: boolean
  onLoadMore: () => void
  children: ReactNode
}

/** 네 활동 목록의 폭, 제목, 데이터 상태와 페이지네이션을 한 곳에서 관리한다. */
export const ActivityListLayout = ({
  title,
  description,
  isPending,
  isError,
  isEmpty,
  emptyText,
  emptyAction,
  hasNextPage,
  isFetchingNextPage,
  onRetry,
  isRetrying,
  onLoadMore,
  children,
}: ActivityListLayoutProps) => (
  <div>
    <section aria-label={title} className="w-full">
      <header className="mb-6 flex flex-col gap-2 tab:mb-8">
        <h2 className={TEXT.section}>{title}</h2>
        <p className={TEXT.sub}>{description}</p>
      </header>
      <ListState
        isPending={isPending}
        isError={isError}
        isEmpty={isEmpty}
        loadingText={`${title}을 불러오는 중이에요.`}
        loadingFallback={<ListRowsSkeleton label={`${title}을 불러오는 중이에요.`} rows={3} />}
        errorText={`${title}을 불러오지 못했어요.`}
        emptyText={emptyText}
        emptyAction={emptyAction}
        onRetry={onRetry}
        isRetrying={isRetrying}
      >
        <ul className="flex flex-col gap-4">{children}</ul>
      </ListState>
      {isError && !isEmpty && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <AlertMessage status="error" message="목록을 갱신하지 못했어요. 다시 시도해 주세요." />
          <RetryButton onRetry={onRetry} isRetrying={isRetrying} />
        </div>
      )}
      <InfiniteScrollTrigger
        onIntersect={onLoadMore}
        hasNextPage={!isError && hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </section>
  </div>
)
