import { PetTasteDiscovery } from '@/features/playground-tools'
import { createPageMetadata } from '@/shared/lib/metadata'

export const metadata = createPageMetadata({
  title: '우리 아이 취향 찾기',
  description: '네 가지 질문에 답하고 우리 아이의 오늘 취향 카드를 만들어요.',
  path: '/playground/taste',
})
export default function TastePage() {
  return <PetTasteDiscovery />
}
