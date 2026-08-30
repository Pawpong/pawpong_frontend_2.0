'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useInfiniteQuery } from '@tanstack/react-query'
import {
  Container,
  DeleteConfirmModal,
  InfiniteScrollTrigger,
  ListState,
  LoginPromptModal,
  NavigationBar,
  SearchButton,
} from '@/shared/ui'
import { PlusIcon } from '@/shared/assets'
import {
  COMMUNITY_LOGIN_PROMPT,
  CommunityFeedCardSkeleton,
  communityQueries,
  toCommunityPreviewProps,
} from '@/entities/community'
import { ConnectedFeedCard, useDeletePostConfirm } from '@/features/community'
import { useLoginGuard, useMe } from '@/features/auth'
import { flattenPages } from '@/shared/lib/infiniteList'

const CommunityContent = () => {
  const router = useRouter()
  // 입력 중인 값과 실제 조회 조건을 분리한다 — 타이핑마다 재조회하지 않도록
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  // 좋아요·북마크는 비로그인 요청이 401로 떨어지므로 먼저 로그인으로 유도한다
  const { guard, isPromptOpen, setPromptOpen } = useLoginGuard()
  const { me } = useMe()
  // [refactored] 삭제 확인 state·mutation·핸들러를 useDeletePostConfirm으로 (마이홈과 공유)
  const { requestDelete, modalProps: deleteModalProps } = useDeletePostConfirm()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError } =
    useInfiniteQuery(
      communityQueries.posts('latest', undefined, undefined, appliedSearch || undefined),
    )
  const posts = flattenPages(data)

  return (
    <div className="flex w-full flex-col">
      {/* 상단바 — 공통 NavigationBar (Figma 2063-213675 navigation bar) */}
      <NavigationBar title="포퐁커뮤니티" backHref="/" />

      {/* 검색 (Figma 1657-251460 — 버튼 클릭 시 focus 입력 pill로 전환)
          padding: mo 8·16 / tab 12·48 (px-4=모바일 16, tab48은 Container 기본값) */}
      <Container className="flex justify-end px-4 py-2 tab:py-3">
        <SearchButton
          active={searchOpen}
          value={query}
          onChange={setQuery}
          onClick={() => setSearchOpen(true)}
          onSubmit={() => setAppliedSearch(query.trim())}
          // 비어 있을 때 포커스 잃으면 트리거로 복귀 (적용된 검색어도 함께 해제)
          onBlur={() => {
            if (query.trim() !== '') return
            setSearchOpen(false)
            setAppliedSearch('')
          }}
          // 모바일은 풀폭, tab+는 최대 300px
          className="max-w-none tab:max-w-[18.75rem]"
        />
      </Container>

      {/* Main: Feed — Figma CommunityFeedCard(3606:622637)의 343px 카드 폭을 전 구간에서
          유지한다. 넓은 중간 화면에서 1:1 미디어가 과도하게 커지지 않게 하고, 20px 거터와
          중립 표면으로 카드의 16px 모서리가 명확히 보이게 한다. */}
      <Container className="bg-neutral-100 px-4 pt-5 pb-10 tab:pt-8 tab:pb-16">
        <div className="mx-auto w-full max-w-[21.4375rem]">
          {/* 로딩은 ListState 문구 대신 카드 골격으로 — 피드는 화면 대부분이 이미지라 덜 흔들린다 */}
          {isPending && (
            <div className="flex min-w-0 flex-col gap-6 tab:gap-8 pc:gap-10">
              {[0, 1, 2].map((i) => (
                <CommunityFeedCardSkeleton key={i} />
              ))}
            </div>
          )}

          <ListState
            isPending={false}
            isError={isError}
            isEmpty={!isPending && posts.length === 0}
            loadingText="게시글을 불러오는 중입니다."
            errorText="게시글을 불러오지 못했습니다."
            emptyText={
              appliedSearch ? `'${appliedSearch}' 검색 결과가 없습니다.` : '게시글이 없습니다.'
            }
          >
            <div className="flex min-w-0 flex-col gap-6 tab:gap-8 pc:gap-10">
              {posts.map((post) => {
                // [refactored] 같은 소유자 판정을 onEdit·onDelete에서 두 번 하던 것을 이름으로
                const isMyPost = me?.userId === post.authorId

                return (
                  <ConnectedFeedCard
                    key={post.postId}
                    guard={guard}
                    {...toCommunityPreviewProps(post)}
                    onEdit={
                      isMyPost
                        ? () => router.push(`/community/post/${post.postId}/edit`)
                        : undefined
                    }
                    onDelete={isMyPost ? () => requestDelete(post.postId) : undefined}
                  />
                )
              })}
            </div>
          </ListState>

          <InfiniteScrollTrigger
            onIntersect={fetchNextPage}
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
          />
        </div>
      </Container>

      {/* 글작성 — 상단 작성 유도 바를 대신하는 우하단 고정 FAB (Figma "글작성" BaseButton) */}
      <Link
        href="/community/write"
        className="fixed right-6 bottom-6 z-sticky flex h-12 items-center gap-1 rounded-full bg-point-500 px-4 shadow-[0_7px_7px_rgba(55,55,55,0.1)]"
      >
        <PlusIcon className="size-6 text-neutral-850" />
        <span className="text-base leading-[1.5] font-semibold text-neutral-850">글작성</span>
      </Link>

      <LoginPromptModal
        open={isPromptOpen}
        onOpenChange={setPromptOpen}
        description={COMMUNITY_LOGIN_PROMPT.reaction} // [refactored]
      />

      <DeleteConfirmModal target="게시글" {...deleteModalProps} />
    </div>
  )
}

export { CommunityContent }
