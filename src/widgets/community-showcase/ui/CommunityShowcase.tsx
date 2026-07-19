import { Container, SectionHeader } from '@/shared/ui'
import { PostCard } from '@/entities/community'
import { MOCK_MY_HOME_POSTS, toPostCardProps } from '@/shared/mocks/myHome'

// ponytail: 커뮤니티 API 미연결 — my-home mock 재사용. 연결 시 실제 게시글 목록으로 교체.
const POSTS = MOCK_MY_HOME_POSTS.slice(0, 3)

/** 공통 PostCard를 테두리 카드로 감쌈 (Figma home-contents, SavedFeedsTab과 동일 패턴) */
const ShowcaseCard = ({ post }: { post: (typeof POSTS)[number] }) => (
  <div className="rounded-[0.5rem] border border-[#cacaca] bg-white">
    <PostCard profileType="responsivePc" className="px-3" {...toPostCardProps(post)} />
  </div>
)

const CommunityShowcase = () => {
  return (
    <Container className="py-6 tab:py-8 pc:py-12">
      <div className="flex flex-col gap-[0.75rem]">
        <SectionHeader title="우리 아이 자랑하기" linkText="커뮤니티 보러가기" linkHref="/community" />

        {/* 모바일·태블릿: 풀폭 카드 1개 (Figma 940-38371 / 940-39191) */}
        <div className="pc:hidden">
          <ShowcaseCard post={POSTS[0]} />
        </div>

        {/* PC: 3열 그리드 (Figma 940-29281) */}
        <div className="hidden gap-[2.5rem] pc:grid pc:grid-cols-3">
          {POSTS.map((post) => (
            <ShowcaseCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </Container>
  )
}

export { CommunityShowcase }
