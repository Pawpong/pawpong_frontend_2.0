import { OutingChecklist } from '@/features/playground-tools'
import { createPageMetadata } from '@/shared/lib/metadata'

export const metadata = createPageMetadata({
  title: '외출 준비함',
  description: '산책·카페·여행·병원 방문, 우리 아이의 외출 준비물을 함께 챙겨요.',
  path: '/playground/outing',
})
export default function OutingPage() {
  return <OutingChecklist />
}
