'use client'

import { Container } from '@/shared/ui'
import { PostCard } from '@/entities/community'
import { toPostCardProps, type MyHomePost } from '@/shared/mocks/myHome'

interface SavedFeedsTabProps {
  feeds: MyHomePost[]
}

const SavedFeedsTab = ({ feeds }: SavedFeedsTabProps) => (
  // 저장피드 전용 패딩 — 모바일 py48·px16 / tab 48 전방향 (tab px는 Container 기본 48)
  <Container className="px-4 py-12">
    {/* 각 피드가 개별 보더 카드 (Figma 2091-148897) — 카드 간 gap 모바일 20 / tab 28, tab max-w 59.25rem 가운데 */}
    <div className="flex flex-col gap-5 tab:mx-auto tab:max-w-[59.25rem] pc:gap-7">
      {feeds.map((post) => (
        <div key={post.id} className="rounded-lg border border-[#cacaca] bg-white">
          {/* 저장피드: ProfileHeader sm 헤더 + 모바일 좌우 패딩 보완(px-3) */}
          <PostCard profileType="sm" className="px-3" {...toPostCardProps(post)} />
        </div>
      ))}
    </div>
  </Container>
)

export { SavedFeedsTab }
