'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { Container, SectionHeader } from '@/shared/ui'
import { PostCard, communityQueries } from '@/entities/community'
import type { CommunityPostCard } from '@/shared/types'
import { MOCK_MY_HOME_POSTS, toPostCardProps } from '@/shared/mocks/myHome'

const CARD_COUNT = 3

// CommunityPostCard → 공통 PostCard props 매핑
const toShowcaseProps = (post: CommunityPostCard) => ({
  author: {
    id: post.authorId,
    nickname: post.authorNickname,
    profileImageUrl: post.authorProfileImageUrl,
  },
  createdAt: post.createdAt,
  text: post.bodyExcerpt,
  images: post.photoUrls,
  likeCount: post.likeCount,
  commentCount: post.commentCount,
  detailHref: `/community/${post.postId}`,
})

/** 공통 PostCard를 테두리 카드로 감쌈 (Figma home-contents, SavedFeedsTab과 동일 패턴) */
const ShowcaseCard = ({
  post,
  showMore,
}: {
  post: ReturnType<typeof toShowcaseProps>
  showMore?: boolean
}) => (
  <div className="rounded-[0.5rem] border border-[#cacaca] bg-white transition-colors hover:bg-[#f6f6f6] hover:shadow-[0_7px_7px_0_rgba(55,55,55,0.1)] active:bg-[#f6f6f6] active:shadow-[0_7px_7px_0_rgba(55,55,55,0.1)]">
    <PostCard profileType="responsivePc" showMore={showMore} className="px-3" {...post} />
  </div>
)

const CommunityShowcase = () => {
  // 홈은 부분 실패 허용 — throwOnError만 꺼서 실패 시 목업 유지 (커뮤니티 페이지는 기본 정책)
  const { data } = useInfiniteQuery({
    ...communityQueries.posts('latest', undefined, undefined, CARD_COUNT),
    throwOnError: false,
  })
  const fetched = (data?.pages[0]?.items ?? []).slice(0, CARD_COUNT).map(toShowcaseProps)

  // 데이터 없으면(로딩/실패/빈 목록) 목업으로 스켈레톤 유지
  const posts =
    fetched.length > 0 ? fetched : MOCK_MY_HOME_POSTS.slice(0, CARD_COUNT).map(toPostCardProps)

  return (
    <Container className="py-6 tab:py-8 pc:py-12">
      <div className="flex flex-col gap-[0.75rem]">
        <SectionHeader title="우리 아이 자랑하기" linkText="커뮤니티" linkHref="/community" />

        {/* 모바일·태블릿: 풀폭 카드 1개 + 미리보기 [더보기] (Figma 940-38371 / 940-39191) */}
        <div className="pc:hidden">
          <ShowcaseCard post={posts[0]} showMore />
        </div>

        {/* PC: 3열 그리드 (Figma 940-29281) */}
        <div className="hidden gap-[2.5rem] pc:grid pc:grid-cols-3">
          {posts.map((post) => (
            <ShowcaseCard key={post.detailHref} post={post} />
          ))}
        </div>
      </div>
    </Container>
  )
}

export { CommunityShowcase }
