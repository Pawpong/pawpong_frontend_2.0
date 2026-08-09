'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { ShowcaseSection } from '@/shared/ui'
import { CommunityBox, communityQueries, toCommunityPreviewProps } from '@/entities/community'
import { MOCK_MY_HOME_POSTS } from '@/shared/mocks/myHome'

const CARD_COUNT = 3

const CommunityShowcase = () => {
  // 홈은 부분 실패 허용 — throwOnError만 꺼서 실패 시 목업 유지 (커뮤니티 페이지는 기본 정책)
  const { data } = useInfiniteQuery({
    ...communityQueries.posts('latest', undefined, undefined, CARD_COUNT),
    throwOnError: false,
  })
  const fetched = (data?.pages[0]?.items ?? []).slice(0, CARD_COUNT).map(toCommunityPreviewProps)

  // 데이터 없으면(로딩/실패/빈 목록) 목업으로 스켈레톤 유지
  const posts =
    fetched.length > 0
      ? fetched
      : MOCK_MY_HOME_POSTS.slice(0, CARD_COUNT).map(toCommunityPreviewProps)

  return (
    <ShowcaseSection title="동물 자랑하기" linkText="커뮤니티 바로가기" linkHref="/community">
      {/* 한 DOM 목록을 브레이크포인트별 그리드로 재배치한다. */}
      <div className="grid grid-cols-[20.0625rem] justify-center gap-y-2 tab:grid-cols-[repeat(2,20.0625rem)] tab:justify-between pc:grid-cols-[repeat(3,25.4375rem)] pc:gap-y-0">
        {posts.map((post, index) => (
          <CommunityBox
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
