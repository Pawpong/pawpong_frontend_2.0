'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Container, InfiniteScrollTrigger, SearchButton } from '@/shared/ui'
import { PlusIcon } from '@/shared/assets/icons'
import { communityQueries, toCommunityPreviewProps } from '@/entities/community'
import { cn } from '@/shared/lib/cn'
import { flattenPages } from '@/shared/lib/infiniteList'
import { CommunityFeedCard } from './CommunityFeedCard'
import { MOCK_COMMUNITY_FEED } from './mockFeed'

const CommunityContent = () => {
  const { data, isPending, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    communityQueries.posts('latest'),
  )
  const fetchedPosts = flattenPages(data)
  // 최은진: 목업 피드(mockFeed) 폴백 추가 — 기존엔 fetchedPosts를 그대로 posts로 썼다.
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
      {/* 최은진: 상단 NavigationBar("‹ 포퐁커뮤니티") 제거 — Figma
          node 3557:417738에 사용자가 새로 구성한 pc/tab/mo 3종 모두 공통 헤더
          바로 다음에 검색 행이 온다(별도 타이틀 행 없음). */}

      {/* 검색 (Figma 1657-251460 — 버튼 클릭 시 focus 입력 pill로 전환)
          padding: mo 8·16 / tab 12·48 (px-4=모바일 16, tab48은 Container 기본값) */}
      <Container className="flex justify-end px-4 py-2 tab:py-3">
        {/* 최은진: mo의 검색 "트리거"(비활성) 상태가 SearchButton 기본 스타일(w-auto,
            content-hug) 탓에 오른쪽에 작은 알약으로만 떠 있었다 — get_design_context로
            mo scroll interaction(node 3839:105894)을 다시 보니 비활성 상태도 행 전체
            폭을 채우고 텍스트는 왼쪽·아이콘은 오른쪽(justify-between)이었다. 활성(입력)
            상태는 기존 SearchButton 기본값이 이미 이 모양이라 그대로 둔다. */}
        <SearchButton
          active={searchOpen}
          value={query}
          onChange={setQuery}
          onClick={() => setSearchOpen(true)}
          // 비어 있을 때 포커스 잃으면 트리거로 복귀
          onBlur={() => query.trim() === '' && setSearchOpen(false)}
          className={cn(
            // 모바일은 풀폭, tab+는 최대 300px
            searchOpen
              ? 'max-w-none tab:max-w-[18.75rem]'
              : 'w-full justify-between tab:w-auto tab:justify-center',
          )}
        />
      </Container>

      {/* 최은진: 게시판형 카드(ConnectedPostCard, 구분선으로 나열)를 인스타그램식 단일 컬럼
          피드(CommunityFeedCard)로 전면 교체. pc 폭도 게시판형 948px에서 좁은 피드 폭
          415px로 변경 — 이미지가 도드라지도록. */}
      {/* Main: Feed — 인스타그램 홈처럼 카드 하나하나를 스크롤하며 보는 단일 컬럼 피드.
          pc는 이미지가 도드라지도록 게시판형 폭(948px) 대신 좁은 피드 폭(415px)으로 가운데 정렬 */}
      {/* 최은진: mo만 좌우 여백(px-0) 없이 화면 꽉 차게 — 참고 프로젝트(바탕화면 pawpong)의
          "mo에서는 카드가 화면 끝까지 닿는" 인스타그램 모바일 피드 방식과 동일하게 맞췄다.
          tab·pc는 Container 자체의 기본 여백(tab:3rem/pc:5rem)을 그대로 쓰도록 건드리지 않음 —
          className은 mo 값(px-0)만 덮어쓰고 tab:/pc: 접두사가 붙은 값은 병합 시 유지된다. */}
      {/* 최은진: 하단 여백을 mo까지 포함해 64px(pb-16)로 통일 — Figma
          node 3557:417738의 pc/tab/mo 프레임 전부 피드 마지막 카드 아래 남는
          공간이 정확히 64px로 동일했다(기존엔 mo만 40px/pb-10). */}
      <Container className="px-0 pb-16">
        {/* 최은진: 좁은 피드 폭(415px)을 pc 전용에서 tab 이상 전체로 확장 — Figma에서
            tab(768) 프레임도 pc와 동일하게 카드가 415px로 중앙 정렬돼 있었다(예전엔
            tab에서 카드가 풀와이드로 늘어났다). */}
        <div className="mx-auto w-full tab:max-w-[415px]">
          {/* 최은진: 카드 간격을 브레이크포인트별로 늘리던 걸(24/32/40) 36px(gap-9)
              고정으로 통일 — Figma pc/tab/mo 3종 전부 카드 사이 간격이 정확히 36px로
              동일했다. */}
          <div className="flex flex-col gap-9">
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

      {/* 최은진: 상단 InputUpload 작성 유도 바를 제거하고, 우하단 고정 FAB로 교체 (Figma "글작성" BaseButton) */}
      {/* 최은진: BaseButton 스펙을 get_design_context로 다시 확인해 px-4→p-2(패딩
          8px 균등), gap-1→gap-0(아이콘·텍스트 사이 간격 없음), 그림자 블러
          7px→3.5px로 정정 (node 3839:105871). */}
      <Link
        href="/community/write"
        className="fixed right-6 bottom-6 z-40 flex h-12 items-center gap-0 rounded-full bg-point-500 p-2 shadow-[0_7px_3.5px_rgba(55,55,55,0.1)]"
      >
        <PlusIcon className="size-6 text-neutral-850" />
        <span className="text-base leading-[1.5] font-semibold text-neutral-850">글작성</span>
      </Link>
    </div>
  )
}

export { CommunityContent }
