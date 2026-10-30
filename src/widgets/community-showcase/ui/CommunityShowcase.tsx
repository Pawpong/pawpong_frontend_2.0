'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { ListState, ShowcaseSection } from '@/shared/ui'
import { SkeletonBlock } from '@/shared/ui/Skeleton'
import {
  CommunityMediaCard,
  communityQueries,
  getFirstPhotoPostId,
  toCommunityPreviewProps,
} from '@/entities/community'
import { flattenPages } from '@/shared/lib/infiniteList'

const CARD_COUNT = 5

// 불러온 타일과 같은 줄 배치를 스켈레톤과 함께 쓴다. 타일 폭은 이 줄이 정한다 —
// mo 122px 칸을 가로로 이어 스크롤, tab 부터 5열 — 간격은 분양중인 동물(공통 카드 격자)과 같아 세로 칸이 맞는다.
const ROW_CLASS =
  'grid w-max auto-cols-[7.625rem] grid-flow-col gap-3 tab:w-full tab:grid-flow-row tab:grid-cols-5 tab:gap-5'

const CommunityShowcase = () => {
  // 홈은 부분 실패 허용 — 오류를 전역 바운더리로 던지지 않고 섹션 안에서 안내한다.
  const { data, isPending, isError } = useInfiniteQuery({
    ...communityQueries.posts('latest', undefined, undefined, undefined, CARD_COUNT),
    throwOnError: false,
  })
  const posts = flattenPages(data).slice(0, CARD_COUNT)
  const firstPhotoPostId = getFirstPhotoPostId(posts)
  const fetched = posts.map(toCommunityPreviewProps)

  return (
    <ShowcaseSection
      title="동물 자랑하기"
      linkText="커뮤니티 바로가기"
      linkHref="/community"
      className="tab:py-10"
      titleClassName="tab:text-xl"
    >
      <ListState
        appPublicContent
        isPending={isPending}
        isError={isError}
        isEmpty={fetched.length === 0}
        loadingText="커뮤니티 게시글을 불러오는 중이에요."
        loadingFallback={
          <div role="status" aria-busy="true" className="w-full overflow-hidden">
            <span className="sr-only">커뮤니티 게시글을 불러오는 중이에요.</span>
            <div className={ROW_CLASS} aria-hidden>
              {Array.from({ length: CARD_COUNT }, (_, index) => (
                <SkeletonBlock key={index} className="aspect-square w-full" />
              ))}
            </div>
          </div>
        }
        errorText="커뮤니티 게시글을 불러오지 못했어요."
        emptyText="아직 등록된 커뮤니티 게시글이 없어요."
      >
        {/* Figma Community Feed Card-my home:
            mo는 122px 타일을 12px 간격으로 스크롤, tab부터는 화면 폭에 비례해 확대
            (분양중인 동물 카드와 같은 보간) — tab 5열, pc 4열(≈300px).
            스크롤 뷰포트에 자체 max-w를 두면 섹션 타이틀과 좌우 여백이 어긋난다 — PageShell 폭 그대로 둔다. */}
        <div className="w-full overflow-x-auto">
          <div className={ROW_CLASS}>
            {fetched.map((post, index) => (
              <CommunityMediaCard
                key={post.detailHref ?? index}
                href={post.detailHref ?? `/community/post/${post.postId}`}
                imageUrl={post.images?.[0]}
                imageCount={post.images?.length ?? 0}
                alt={`${post.author.nickname}의 게시글 이미지`}
                preload={post.postId === firstPhotoPostId}
              />
            ))}
          </div>
        </div>
      </ListState>
    </ShowcaseSection>
  )
}

export { CommunityShowcase }
