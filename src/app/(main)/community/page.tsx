import { createPageMetadata } from '@/shared/lib/metadata'

import { CommunityContent } from './_ui/CommunityContent'

export const metadata = createPageMetadata({
  title: '커뮤니티',
  description: '반려동물의 일상과 사진을 나누고 다른 보호자와 소통해 보세요.',
  path: '/community',
})

const CommunityPage = () => {
  return <CommunityContent />
}

export default CommunityPage
