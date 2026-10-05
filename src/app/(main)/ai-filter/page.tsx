import { createPageMetadata } from '@/shared/lib/metadata'

import { AiFilterContent } from './_ui/AiFilterContent'

export const metadata = createPageMetadata({
  title: 'AI 필터',
  description:
    '우리 아이 사진 한 장으로 도트 그림·스티커·수채화까지. 포퐁 AI 필터로 만들어 보세요.',
  path: '/ai-filter',
})

const AiFilterPage = async ({ searchParams }: { searchParams: Promise<{ purpose?: string }> }) => {
  const params = await searchParams
  return <AiFilterContent gameCharacter={params.purpose === 'pet-sprite-v1'} />
}

export default AiFilterPage
