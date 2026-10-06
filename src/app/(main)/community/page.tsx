import { createPageMetadata } from '@/shared/lib/metadata'

import { CommunityContent } from './_ui/CommunityContent'
import { Suspense } from 'react'

export const metadata = createPageMetadata({
  title: '커뮤니티',
  description: '반려동물의 일상과 사진을 나누고 다른 보호자와 소통해 보세요.',
  path: '/community',
})

const CommunityPage = () => {
  return (
    <Suspense
      fallback={
        <p role="status" className="p-5">
          커뮤니티 탐색을 준비하고 있어요.
        </p>
      }
    >
      <CommunityContent />
    </Suspense>
  )
}

export default CommunityPage
