import type { Metadata } from 'next'
import { AiFilterContent } from './_ui/AiFilterContent'

export const metadata: Metadata = {
  title: 'AI 필터',
  description:
    '우리 아이 사진 한 장으로 도트 그림·스티커·수채화까지. 포퐁 AI 필터로 만들어 보세요.',
}

const AiFilterPage = () => <AiFilterContent />

export default AiFilterPage
