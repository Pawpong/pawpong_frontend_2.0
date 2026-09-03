'use client'

import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { noticeQueries } from '@/entities/notice'
import { ChevronDownIcon } from '@/shared/assets'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { flattenPages } from '@/shared/lib/infiniteList'
import { formatDate } from '@/shared/lib/formatDate'
import {
  Badge,
  Button,
  Container,
  InfiniteScrollTrigger,
  ListState,
  NavigationBar,
} from '@/shared/ui'
import type { Notice } from '@/shared/types'

// 공지 행 — FAQ 목록(FaqItem)과 완전히 같은 규격.
// 카드/보더/그림자 없이 neutral-300 구분선만 있는 플러시 리스트, 클릭하면(상세 이동 대신)
// 그 자리에서 펼쳐진다 — 목록 응답에 content가 이미 실려오므로 별도 상세 조회가 필요 없다.
const NoticeRow = ({ notice }: { notice: Notice }) => (
  <details className="group border-b border-neutral-300 last:border-b-0">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500 [&::-webkit-details-marker]:hidden">
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {notice.isPinned && (
          <Badge variant="primaryFilled" size="md">
            고정
          </Badge>
        )}
        <span className="min-w-0 text-base leading-[1.5] font-semibold text-neutral-850">
          {notice.title}
        </span>
        <span className="text-xs font-medium text-neutral-500">
          {formatDate(notice.publishedAt ?? notice.createdAt)}
        </span>
      </span>
      <ChevronDownIcon className="size-6 shrink-0 text-neutral-850 transition-transform group-open:rotate-180" />
    </summary>
    <div className="mb-4 rounded-lg bg-point-100 p-3 text-base leading-[1.5] font-medium whitespace-pre-line text-neutral-850">
      {notice.content}
    </div>
  </details>
)

/** 공지사항 목록 (Figma 전체 메뉴 3555:416834). GET /api/v2/notice */
const NoticesContent = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError, refetch } =
    useInfiniteQuery(noticeQueries.list())
  const notices = useMemo(() => dedupeBy(flattenPages(data), (notice) => notice.noticeId), [data])

  return (
    <div className="flex w-full flex-1 flex-col bg-white pb-16">
      <NavigationBar title="공지사항" titleClassName="font-cafe24 text-2xl tab:text-2xl" />

      <Container className="py-5 tab:py-8 pc:py-10">
        {/* FAQ 목록과 같은 1134px 열 (pc:max-w-[70.875rem]) */}
        <div className="mx-auto w-full pc:max-w-[70.875rem]">
          <ListState
            isPending={isPending}
            isError={isError}
            isEmpty={notices.length === 0}
            loadingText="공지사항을 불러오는 중입니다."
            errorText="공지사항을 불러오지 못했습니다."
            emptyText="등록된 공지사항이 없습니다."
            errorAction={
              <Button variant="fill" size="sm" className="px-4" onClick={() => void refetch()}>
                다시 시도
              </Button>
            }
          >
            <div>
              {notices.map((notice) => (
                <NoticeRow key={notice.noticeId} notice={notice} />
              ))}
            </div>
          </ListState>

          <InfiniteScrollTrigger
            onIntersect={fetchNextPage}
            hasNextPage={!!hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        </div>
      </Container>
    </div>
  )
}

export { NoticesContent }
