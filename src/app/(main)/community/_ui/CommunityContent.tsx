'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Container, InfiniteScrollTrigger, NavigationBar, SearchButton } from '@/shared/ui'
import { PlusIcon } from '@/shared/assets/icons'
import { communityQueries, toCommunityPreviewProps } from '@/entities/community'
import { flattenPages } from '@/shared/lib/infiniteList'
import { CommunityFeedCard } from './CommunityFeedCard'
import { MOCK_COMMUNITY_FEED } from './mockFeed'

const CommunityContent = () => {
  const { data, isPending, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    communityQueries.posts('latest'),
  )
  const fetchedPosts = flattenPages(data)
  // 개발 환경에서 백엔드가 없어 API가 실패/빈 목록으로 끝나면 목업 피드로 폴백한다.
  // 로딩이 끝났는데도 게시글이 하나도 없을 때만 켜지므로, 실제 운영 빌드에서는 절대 노출되지 않는다.
  const posts =
    process.env.NODE_ENV !== 'production' && !isPending && fetchedPosts.length === 0
      ? MOCK_COMMUNITY_FEED
      : fetchedPosts

  // ponytail: 서버 검색 API 미구현 → 지금은 검색바 펼치기 UI만. keyword 파라미터 생기면 query 연결.
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

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
          // 비어 있을 때 포커스 잃으면 트리거로 복귀
          onBlur={() => query.trim() === '' && setSearchOpen(false)}
          // 모바일은 풀폭, tab+는 최대 300px
          className="max-w-none tab:max-w-[18.75rem]"
        />
      </Container>

      {/* Main: Feed — 인스타그램 홈처럼 카드 하나하나를 스크롤하며 보는 단일 컬럼 피드.
          pc는 이미지가 도드라지도록 게시판형 폭(948px) 대신 좁은 피드 폭(415px)으로 가운데 정렬 */}
      <Container className="px-4 pb-10 tab:pb-16">
        <div className="mx-auto w-full pc:max-w-[415px]">
          <div className="flex flex-col gap-6 tab:gap-8 pc:gap-10">
            {posts.map((post) => (
              <CommunityFeedCard key={post.postId} {...toCommunityPreviewProps(post)} />
            ))}
          </div>

          <InfiniteScrollTrigger
            onIntersect={fetchNextPage}
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
          />
        </div>
      </Container>

      {/* 글쓰기 진입점 — 상단 InputUpload 바 대신, 우하단 고정 FAB로 변경 (Figma "글작성" BaseButton) */}
      <Link
        href="/community/write"
        className="fixed right-6 bottom-6 z-40 flex h-12 items-center gap-1 rounded-full bg-point-500 px-4 shadow-[0_7px_7px_rgba(55,55,55,0.1)]"
      >
        <PlusIcon className="size-6 text-neutral-850" />
        <span className="text-base leading-[1.5] font-semibold text-neutral-850">글작성</span>
      </Link>
    </div>
  )
}

export { CommunityContent }
