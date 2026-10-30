'use client'

import type { HighlightPlacement } from '@/entities/feature-highlight'
import { CareMapEntry } from '@/widgets/care-map-entry'
import { FeatureHighlights } from '@/widgets/feature-highlights'

// 지도 표현과 소개 데이터 위젯은 앱 계층에서 조합한다(FSD 위젯 간 의존 금지).
// 지도 카드는 홈과 같은 고정 배너라 관리자 문구·버튼은 쓰지 않고 노출 여부만 따른다.
const renderMap = () => <CareMapEntry />

export function ManagedFeatureHighlights({ placement }: { placement: HighlightPlacement }) {
  return (
    <FeatureHighlights
      placement={placement}
      renderMap={renderMap}
      className={placement === 'playground' ? '-mt-8 pt-0 pb-16 tab:pt-0 tab:pb-16' : undefined}
    />
  )
}
