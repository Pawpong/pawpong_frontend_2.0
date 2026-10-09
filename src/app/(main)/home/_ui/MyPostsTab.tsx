'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { communityQueries } from '@/entities/community'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { flattenPages, getTotalItems } from '@/shared/lib/infiniteList'
import { Chip, ListHeader } from '@/shared/ui'
import { EmptyStateLink } from '@/shared/ui/EmptyStateLink'
import { useAuthReadSession } from '@/shared/lib/useAuthReadSession'
import type { AuthReadSession } from '@/shared/api'
import { HomePostGrid } from './HomePostGrid'

const POST_FILTERS = [
  { value: 'written', label: '작성한 글' },
  { value: 'commented', label: '댓글 단 글' },
  { value: 'liked', label: '좋아요한 글' },
  // 저장목록의 '저장 피드' 탭을 옮겨 왔다 — 같은 커뮤니티 글 목록이라 칩 하나로 충분하다
  { value: 'saved', label: '저장한 글' },
] as const

type PostFilter = (typeof POST_FILTERS)[number]['value']

const STATE_TEXT: Record<
  PostFilter,
  { loadingText: string; errorText: string; emptyText: string }
> = {
  written: {
    loadingText: '내가 쓴 글을 불러오는 중이에요.',
    errorText: '내가 쓴 글을 불러오지 못했어요.',
    emptyText: '아직 쓴 글이 없어요.',
  },
  commented: {
    loadingText: '댓글 단 글을 불러오는 중이에요.',
    errorText: '댓글 단 글을 불러오지 못했어요.',
    emptyText: '아직 댓글을 단 글이 없어요.',
  },
  liked: {
    loadingText: '좋아요한 글을 불러오는 중이에요.',
    errorText: '좋아요한 글을 불러오지 못했어요.',
    emptyText: '아직 좋아요한 글이 없어요.',
  },
  saved: {
    loadingText: '저장한 글을 불러오는 중이에요.',
    errorText: '저장한 글을 불러오지 못했어요.',
    emptyText: '아직 저장한 글이 없어요.',
  },
}

// 빈 목록에서 바로 다음 행동으로 잇는다. 쓴 글이 없으면 쓰기로, 반응한 글이 없으면 둘러보기로.
const EMPTY_ACTION: Record<PostFilter, ReactNode> = {
  written: <EmptyStateLink href="/community/write">첫 이야기 쓰기</EmptyStateLink>,
  commented: <EmptyStateLink href="/community">커뮤니티 둘러보기</EmptyStateLink>,
  liked: <EmptyStateLink href="/community">커뮤니티 둘러보기</EmptyStateLink>,
  saved: <EmptyStateLink href="/community">커뮤니티 둘러보기</EmptyStateLink>,
}

interface PostsViewProps {
  /** 개수는 칩마다 조회 결과에서 나오므로 각 목록이 헤더를 그린다 */
  renderHeader: (count?: number) => ReactNode
  gridClassName?: string
}

/** 작성한 글 — 기존 마이홈 '게시글' 목록(authorId=me) 그대로 */
const WrittenPosts = ({
  enabled,
  renderHeader,
  gridClassName,
}: PostsViewProps & { enabled: boolean }) => {
  const query = useQuery({
    ...communityQueries.myPosts(enabled),
    refetchOnMount: 'always',
    throwOnError: false,
  })

  return (
    <HomePostGrid
      posts={query.data?.items ?? []}
      isPending={query.isPending}
      isError={query.isError}
      onRetry={() => void query.refetch()}
      isRetrying={query.isFetching}
      header={renderHeader(query.data?.pagination.totalItems)}
      gridClassName={gridClassName}
      emptyAction={EMPTY_ACTION.written}
      {...STATE_TEXT.written}
    />
  )
}

/** 댓글 단 글 · 좋아요한 글 · 저장한 글 — 서버 페이지네이션 무한 스크롤 */
const ActivityPosts = ({
  filter,
  enabled,
  session,
  renderHeader,
  gridClassName,
}: PostsViewProps & {
  filter: Exclude<PostFilter, 'written'>
  enabled: boolean
  session: AuthReadSession | null
}) => {
  const query = useInfiniteQuery({
    ...(filter === 'liked'
      ? communityQueries.myLiked(24, enabled, session)
      : filter === 'saved'
        ? { ...communityQueries.myBookmarks(24), enabled }
        : communityQueries.myCommented(24, enabled, session)),
    throwOnError: false,
  })
  const posts = useMemo(
    () => dedupeBy(flattenPages(query.data), (post) => post.postId),
    [query.data],
  )

  return (
    <HomePostGrid
      posts={posts}
      isPending={query.isPending}
      isError={query.isError}
      onRetry={() => void query.refetch()}
      isRetrying={query.isFetching && !query.isFetchingNextPage}
      pagination={{
        onLoadMore: () => void query.fetchNextPage(),
        hasNextPage: !!query.hasNextPage,
        isFetchingNextPage: query.isFetchingNextPage,
      }}
      header={renderHeader(query.data ? getTotalItems(query.data) : undefined)}
      gridClassName={gridClassName}
      emptyAction={EMPTY_ACTION[filter]}
      {...STATE_TEXT[filter]}
    />
  )
}

/** 마이홈 '내가 쓴 글' 탭 — 작성한 글 / 댓글 단 글 / 좋아요한 글 / 저장한 글을 칩으로 전환한다 */
const MyPostsTab = ({ enabled, gridClassName }: { enabled: boolean; gridClassName?: string }) => {
  const session = useAuthReadSession()
  // 커뮤니티 상세의 '저장한 글 다시 보기'처럼 특정 칩으로 바로 들어오는 링크(?filter=saved)를 받는다
  const requestedFilter = useSearchParams().get('filter')
  const [filter, setFilter] = useState<PostFilter>(
    POST_FILTERS.find((option) => option.value === requestedFilter)?.value ?? 'written',
  )

  // 분양 목록 탭과 같은 '제목 n건' 줄 + 칩. 새 글은 커뮤니티 글쓰기로 바로 간다
  const renderHeader = (count?: number) => (
    <ListHeader
      title="게시글"
      count={count}
      create={{ href: '/community/write', label: '새 글 쓰기' }}
    >
      <div role="group" aria-label="내 글 보기" className="flex flex-wrap items-center gap-2">
        {POST_FILTERS.map((option) => (
          <Chip
            key={option.value}
            size="responsive"
            selected={filter === option.value}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </Chip>
        ))}
      </div>
    </ListHeader>
  )

  return filter === 'written' ? (
    <WrittenPosts enabled={enabled} renderHeader={renderHeader} gridClassName={gridClassName} />
  ) : (
    <ActivityPosts
      key={filter}
      filter={filter}
      enabled={enabled}
      session={session}
      renderHeader={renderHeader}
      gridClassName={gridClassName}
    />
  )
}

export { MyPostsTab }
