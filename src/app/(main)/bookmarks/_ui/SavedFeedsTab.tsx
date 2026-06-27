'use client'

import { Container, SectionHeader } from '@/shared/ui'
import { PostCard } from '@/entities/community'
import { toPostCardProps, type MyHomePost } from '@/shared/mocks/myHome'

interface SavedFeedsTabProps {
  feeds: MyHomePost[]
}

const SavedFeedsTab = ({ feeds }: SavedFeedsTabProps) => (
  <Container>
    <div className="pt-5 tab:pt-8">
      <SectionHeader
        title={`저장한 피드 ${feeds.length}`}
        linkText="커뮤니티 가기"
        linkHref="/community"
      />
    </div>

    {/* 모바일: 카드 stack */}
    <div className="flex flex-col gap-5 pb-15 tab:hidden">
      {feeds.map((post) => (
        <PostCard key={post.id} {...toPostCardProps(post)} />
      ))}
    </div>

    {/* PC: 개별 보더 카드 */}
    <div className="hidden tab:mt-6 tab:flex tab:flex-col tab:gap-3 tab:pb-10">
      {feeds.map((post) => (
        <div key={post.id} className="overflow-hidden rounded-2xl border border-[#cacaca]">
          <PostCard {...toPostCardProps(post)} />
        </div>
      ))}
    </div>
  </Container>
)

export { SavedFeedsTab }
