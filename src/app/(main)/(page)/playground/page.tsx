import { createPageMetadata } from '@/shared/lib/metadata'

import { PlaygroundContent } from './_ui/PlaygroundContent'
import { ManagedFeatureHighlights } from '../_ui/ManagedFeatureHighlights'

export const metadata = createPageMetadata({
  title: '놀이터',
  description:
    '우리 아이의 추억 카드를 만들고, 외출을 준비하고, 함께한 하루를 이야기로 남겨보세요.',
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
