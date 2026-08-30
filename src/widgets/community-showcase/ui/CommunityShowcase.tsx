'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { ListState, ShowcaseSection } from '@/shared/ui'
import { communityQueries, toCommunityPreviewProps } from '@/entities/community'
import { ConnectedCommunityBox } from '@/features/community'
import { flattenPages } from '@/shared/lib/infiniteList'

const CARD_COUNT = 3

const CommunityShowcase = () => {
  // 홈은 부분 실패 허용 — 오류를 전역 바운더리로 던지지 않고 섹션 안에서 안내한다.
  const { data, isPending, isError } = useInfiniteQuery({
    ...communityQueries.posts('latest', undefined, undefined, undefined, CARD_COUNT),
    throwOnError: false,
  })
  // [refactored] 손수 pages[0] 까던 것 → 기존 flattenPages 헬퍼로 통일
  const fetched = flattenPages(data).slice(0, CARD_COUNT).map(toCommunityPreviewProps)

  return (
    <ShowcaseSection title="동물 자랑하기" linkText="커뮤니티 바로가기" linkHref="/community">
      <ListState
        isPending={isPending}
        isError={isError}
        isEmpty={fetched.length === 0}
        loadingText="커뮤니티 게시글을 불러오는 중입니다."
        errorText="커뮤니티 게시글을 불러오지 못했습니다."
        emptyText="아직 등록된 커뮤니티 게시글이 없습니다."
      >
        <div className="mx-auto grid w-full max-w-[20.0625rem] grid-cols-1 gap-y-5 tab:max-w-[52.75rem] tab:grid-cols-2 tab:gap-x-[1.875rem] tab:gap-y-0 pc:max-w-none pc:grid-cols-3 pc:gap-x-[1.84375rem]">
          {fetched.map((post, index) => (
            <ConnectedCommunityBox
              key={post.detailHref ?? index}
              {...post}
              className={index === 2 ? 'hidden pc:flex' : undefined}
            />
          ))}
        </div>
      </ListState>
    </ShowcaseSection>
  )
}

export { CommunityShowcase }
