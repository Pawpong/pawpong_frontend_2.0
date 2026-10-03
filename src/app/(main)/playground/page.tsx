import { createPageMetadata } from '@/shared/lib/metadata'

import { PlaygroundBilling } from '@/features/in-app-purchase'

export const metadata = createPageMetadata({
  title: '놀이터',
  description: 'AI 사진 만들기와 놀이터 이용권을 한곳에서 확인하세요.',
  path: '/playground',
})

export default function PlaygroundPage() {
  return <PlaygroundBilling />
}
