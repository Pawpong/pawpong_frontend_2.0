import { createPageMetadata } from '@/shared/lib/metadata'
import { LevelGuideContent } from './_ui/LevelGuideContent'

export const metadata = {
  ...createPageMetadata({
    title: '포퐁 활동 단계',
    path: '/breeder-level',
    description: '포퐁 활동 단계 30단계와 활동별 EXP 적립 기준',
  }),
  // 활동 기능이 꺼진 환경에서는 빈 화면이라 공개 출시 전까지 검색에 올리지 않는다.
  robots: { index: false, follow: false },
}

export default function Page() {
  return <LevelGuideContent />
}
