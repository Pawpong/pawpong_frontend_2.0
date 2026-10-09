import { PetBtiDiscovery } from '@/features/playground-tools'
import { createPageMetadata } from '@/shared/lib/metadata'

export const metadata = createPageMetadata({
  title: '우리 아이 멍냥BTI',
  description: '열두 가지 질문에 답하고 우리 아이의 16가지 성향 카드를 만들어요.',
  path: '/playground/bti',
})
export default function BtiPage() {
  return <PetBtiDiscovery />
}
