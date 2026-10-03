import { createPageMetadata } from '@/shared/lib/metadata'

import { HallOfFameContent } from './_ui/HallOfFameContent'

export const metadata = createPageMetadata({
  title: '명예의 전당',
  description: '포퐁 커뮤니티에서 사랑받은 우리 아이들을 만나보세요.',
  path: '/hall-of-fame',
})

const HallOfFamePage = () => {
  return <HallOfFameContent />
}

export default HallOfFamePage
