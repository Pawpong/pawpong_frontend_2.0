import { createPageMetadata } from '@/shared/lib/metadata'

import { Suspense } from 'react'
import { ExploreContent } from './_ui/ExploreContent'
import { ManagedFeatureHighlights } from '../_ui/ManagedFeatureHighlights'

export const metadata = createPageMetadata({
  title: '반려동물 탐색',
  description: '강아지·고양이·파충류와 브리더를 만나고 새로운 가족을 찾아보세요.',
  path: '/explore',
})

// ExploreContent 내부에서 useSearchParams 를 사용하므로 Next.js 의 prerender 단계에서
// Suspense 경계를 요구한다. 없으면 빌드가 CSR bailout 에러로 실패한다.
// 폭·여백은 (page) 레이아웃의 페이지 틀이 정한다. 탭 바는 틀 가장자리까지 넓혀 회색선을 잇는다.
const ExplorePage = () => {
  return (
    <Suspense fallback={null}>
      <ManagedFeatureHighlights placement="explore" />
      <ExploreContent />
    </Suspense>
  )
}

export default ExplorePage
