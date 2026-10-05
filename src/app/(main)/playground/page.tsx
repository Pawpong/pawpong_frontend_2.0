import { createPageMetadata } from '@/shared/lib/metadata'

import { PlaygroundContent } from './_ui/PlaygroundContent'
import { ManagedFeatureHighlights } from '../_ui/ManagedFeatureHighlights'

export const metadata = createPageMetadata({
  title: '놀이터',
  description: '사진 한 장으로 우리 아이의 새로운 모습을 만들고 함께 자랑해 보세요.',
  path: '/playground',
})

export default function PlaygroundPage() {
  return (
    <>
      <PlaygroundContent />
      <ManagedFeatureHighlights placement="playground" />
    </>
  )
}
