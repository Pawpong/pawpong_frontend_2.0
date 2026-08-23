'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { ShowcaseSection } from '@/shared/ui'
import { CommunityBox, communityQueries, toCommunityPreviewProps } from '@/entities/community'
import { ConnectedCommunityBox } from '@/features/community'
import { MOCK_MY_HOME_POSTS } from '@/shared/mocks'
import { flattenPages } from '@/shared/lib/infiniteList'

const CARD_COUNT = 3

const CommunityShowcase = () => {
  // 홈은 부분 실패 허용 — throwOnError만 꺼서 실패 시 목업 유지 (커뮤니티 페이지는 기본 정책)
  const { data } = useInfiniteQuery({
    ...communityQueries.posts('latest', undefined, undefined, CARD_COUNT),
    throwOnError: false,
  })
  // [refactored] 손수 pages[0] 까던 것 → 기존 flattenPages 헬퍼로 통일
  const fetched = flattenPages(data).slice(0, CARD_COUNT).map(toCommunityPreviewProps)

  // 데이터 없으면(로딩/실패/빈 목록) 목업으로 스켈레톤 유지
  const isMock = fetched.length === 0
  const posts = isMock
    ? MOCK_MY_HOME_POSTS.slice(0, CARD_COUNT).map(toCommunityPreviewProps)
    : fetched

  // 목업 postId는 실제로 없는 값이라 토글을 연결하면 존재하지 않는 글에 요청이 나간다
  const Card = isMock ? CommunityBox : ConnectedCommunityBox

  return (
    <ShowcaseSection title="동물 자랑하기" linkText="커뮤니티 바로가기" linkHref="/community">
      {/* 한 DOM 목록을 브레이크포인트별 그리드로 재배치한다. */}
      <div className="grid grid-cols-1 gap-y-2 tab:grid-cols-2 tab:gap-x-[1.875rem] pc:grid-cols-3 pc:gap-y-0">
        {posts.map((post, index) => (
          <Card
            key={post.detailHref ?? index}
            {...post}
            className={index === 2 ? 'hidden pc:flex' : undefined}
          />
        ))}
      </div>
    </ShowcaseSection>
  )
}

export { CommunityShowcase }
