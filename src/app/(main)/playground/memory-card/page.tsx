import { MemoryCard } from '@/features/playground-tools'
import { createPageMetadata } from '@/shared/lib/metadata'

export const metadata = createPageMetadata({
  title: '오늘의 추억 카드',
  description: '반려동물 사진과 한 문장으로 나만의 추억 카드를 만들고 간직하세요.',
  path: '/playground/memory-card',
})
export default function MemoryCardPage() {
  return <MemoryCard />
}
