import { OutingDiscovery } from '@/features/playground-tools'
import { createPageMetadata } from '@/shared/lib/metadata'

export const metadata = createPageMetadata({
  title: '오늘의 산책 뽑기',
  description: '동네에서도 집에서도, 오늘의 분위기에 맞는 놀이 카드를 한 장 뽑아요.',
  path: '/playground/walk-card',
})
export default function WalkCardPage() {
  return <OutingDiscovery />
}
