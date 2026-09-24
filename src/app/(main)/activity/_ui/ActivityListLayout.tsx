import type { ReactNode } from 'react'
import { PAGE_WIDTH_CLASS, TEXT } from '@/shared/config'
import { AlertMessage, Button, Container, InfiniteScrollTrigger, ListState } from '@/shared/ui'

interface ActivityListLayoutProps {
  title: string
  description: string
  isPending: boolean
  isError: boolean
  isEmpty: boolean
  emptyText: string
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onRetry: () => void
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
  hasNextPage,
  isFetchingNextPage,
  onRetry,
  onLoadMore,
  children,
}: ActivityListLayoutProps) => (
  <Container className={`${PAGE_WIDTH_CLASS} px-4 py-8 tab:max-w-[90rem] tab:py-10 pc:py-12`}>
    <section aria-label={title} className="w-full">
      <header className="mb-6 flex flex-col gap-2 tab:mb-8">
        <h2 className={TEXT.section}>{title}</h2>
        <p className={TEXT.sub}>{description}</p>
      </header>
      <ListState
        isPending={isPending}
        isError={isError}
        isEmpty={isEmpty}
        loadingText={`${title}을 불러오는 중입니다.`}
        errorText={`${title}을 불러오지 못했습니다.`}
        emptyText={emptyText}
        errorAction={
          <Button variant="fill" size="sm" className="px-4" onClick={onRetry}>
            다시 시도
          </Button>
        }
      >
        <ul className="flex flex-col gap-4">{children}</ul>
      </ListState>
      {isError && !isEmpty && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <AlertMessage status="error" message="목록을 갱신하지 못했어요. 다시 시도해 주세요." />
          <Button variant="outline" size="sm" className="px-4" onClick={onRetry}>
            다시 시도
          </Button>
        </div>
      )}
      <InfiniteScrollTrigger
        onIntersect={onLoadMore}
        hasNextPage={!isError && hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </section>
  </Container>
)
