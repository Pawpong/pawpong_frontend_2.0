import { createPageMetadata } from '@/shared/lib/metadata'
import { getInitialCommunityExperience } from '@/entities/community/server'

import { CommunityContent } from './_ui/CommunityContent'
import { Suspense } from 'react'

export const metadata = createPageMetadata({
  title: '커뮤니티',
  description: '반려동물의 일상과 사진을 나누고 다른 보호자와 소통해 보세요.',
  path: '/community',
})

const CommunityPage = async () => {
  // 카테고리·말머리 줄이 첫 화면부터 보이도록 확장 기능 설정을 서버에서 미리 받는다
  const initialExperience = await getInitialCommunityExperience()
  return (
    <Suspense
      fallback={
        <p role="status" className="p-5">
          커뮤니티 탐색을 준비하고 있어요.
        </p>
      }
    >
      <CommunityContent initialExperience={initialExperience} />
    </Suspense>
  )
}

export default CommunityPage
