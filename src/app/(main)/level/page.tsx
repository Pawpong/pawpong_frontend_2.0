import { createPageMetadata } from '@/shared/lib/metadata'
import { LevelGuideContent } from './_ui/LevelGuideContent'

export const metadata = {
  ...createPageMetadata({
    title: '포퐁 활동 단계',
    path: '/level',
    description: '포퐁 활동 단계 30단계와 활동별 EXP 적립·회수 기준, 레벨/EXP 문의 안내',
  }),
  // 활동 기능이 꺼진 환경에서는 준비 중 안내만 보이므로 공개 출시 전까지 검색에 올리지 않는다.
  robots: { index: false, follow: false },
}

export default function Page() {
  return <LevelGuideContent />
}
