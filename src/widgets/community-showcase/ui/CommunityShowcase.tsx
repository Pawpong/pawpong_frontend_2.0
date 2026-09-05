'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { ListState, ShowcaseSection } from '@/shared/ui'
import {
  CommunityMediaCard,
  communityQueries,
  getFirstPhotoPostId,
  toCommunityPreviewProps,
} from '@/entities/community'
import { flattenPages } from '@/shared/lib/infiniteList'

const CARD_COUNT = 5

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
        isPending={isPending}
        isError={isError}
        isEmpty={fetched.length === 0}
        loadingText="커뮤니티 게시글을 불러오는 중입니다."
        errorText="커뮤니티 게시글을 불러오지 못했습니다."
        emptyText="아직 등록된 커뮤니티 게시글이 없습니다."
      >
        {/* Figma Community Feed Card-my home:
            mo는 122px 타일을 12px 간격으로 스크롤, tab부터는 화면 폭에 비례해 확대
            (분양중인 동물 카드와 같은 보간) — tab 5열, pc 4열(≈300px). */}
        <div className="mx-auto w-full max-w-[21.4375rem] overflow-x-auto tab:max-w-[80rem] pc:max-w-none">
          <div className="flex w-max gap-3 tab:grid tab:w-full tab:grid-cols-5 tab:gap-[clamp(0.75rem,2vw,1.667rem)] pc:grid-cols-4">
            {fetched.map((post, index) => (
              <CommunityMediaCard
                key={post.detailHref ?? index}
                href={post.detailHref ?? `/community/post/${post.postId}`}
                imageUrl={post.images?.[0]}
                imageCount={post.images?.length ?? 0}
                alt={`${post.author.nickname}의 게시글 이미지`}
                preload={post.postId === firstPhotoPostId}
                className={index >= 4 ? 'pc:hidden' : undefined}
              />
            ))}
          </div>
        </div>
      </ListState>
    </ShowcaseSection>
  )
}

export { CommunityShowcase }
