'use client'

import { Fragment, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import {
  Container,
  InfiniteScrollTrigger,
  InputUpload,
  ListState,
  NavigationBar,
  SearchButton,
  Separator,
} from '@/shared/ui'
import { communityQueries, toCommunityPreviewProps } from '@/entities/community'
import { ConnectedPostCard } from '@/features/community'
import { flattenPages } from '@/shared/lib/infiniteList'

const CommunityContent = () => {
  // 입력 중인 값과 실제 조회 조건을 분리한다 — 타이핑마다 재조회하지 않도록
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError } =
    useInfiniteQuery(
      communityQueries.posts('latest', undefined, undefined, appliedSearch || undefined),
    )
  const posts = flattenPages(data)

  return (
    <div className="flex w-full flex-col">
      {/* 상단바 — 공통 NavigationBar (Figma 2063-213675 navigation bar) */}
      <NavigationBar title="포퐁커뮤니티" backHref="/" />

      {/* 작성 유도 바 — 공통 InputUpload (Figma 2063-213676, 상·하 보더 + px mo16/tab48/pc80) */}
      <InputUpload text="게시글을 올려보세요" href="/community/write" />

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

      {/* Main: Feed — 모바일은 카드 나열(gap 20), tab+는 border 박스 하나에 구분선 (Figma 1054-34769)
          pc는 Figma(2063-215749) 기준 948px 고정 폭 가운데 정렬 */}
      <Container className="px-4 pb-10 tab:pb-16">
        <div className="mx-auto w-full pc:max-w-[59.25rem]">
          <ListState
            isPending={isPending}
            isError={isError}
            isEmpty={posts.length === 0}
            loadingText="게시글을 불러오는 중입니다."
            errorText="게시글을 불러오지 못했습니다."
            emptyText={
              appliedSearch ? `'${appliedSearch}' 검색 결과가 없습니다.` : '게시글이 없습니다.'
            }
          >
            <div className="flex min-w-0 flex-col gap-5 tab:gap-8 tab:rounded-lg tab:border tab:border-neutral-300 tab:p-3">
              {posts.map((post, index) => (
                <Fragment key={post.postId}>
                  {index > 0 && <Separator className="bg-border-light" />}
                  <ConnectedPostCard {...toCommunityPreviewProps(post)} />
                </Fragment>
              ))}
            </div>
          </ListState>

          <InfiniteScrollTrigger
            onIntersect={fetchNextPage}
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
          />
        </div>
      </Container>
    </div>
  )
}

export { CommunityContent }
