'use client'

import type { FeatureHighlight, HighlightPlacement } from '@/entities/feature-highlight'
import { CareMapEntry } from '@/widgets/care-map-entry'
import { FeatureHighlights } from '@/widgets/feature-highlights'

// 지도 표현과 소개 데이터 위젯은 앱 계층에서 조합한다(FSD 위젯 간 의존 금지).
const renderMap = (card: FeatureHighlight) => (
  <CareMapEntry
    title={card.title}
    description={card.description}
    eyebrow={card.eyebrow}
    actions={card.actions}
    embedded
  />
)

export function ManagedFeatureHighlights({ placement }: { placement: HighlightPlacement }) {
  return (
    <FeatureHighlights
      placement={placement}
      renderMap={renderMap}
      className={
        placement === 'playground'
          ? '-mt-8 max-w-[68rem] pt-0 pb-16 tab:max-w-[68rem] tab:px-8 tab:pt-0 tab:pb-16 pc:max-w-[68rem] pc:px-10'
          : undefined
      }
    />
  )
}
