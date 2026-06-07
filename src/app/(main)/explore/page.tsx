import { Suspense } from 'react'
import { ExploreContent } from './_ui/ExploreContent'

// ExploreContent 내부에서 useSearchParams 를 사용하므로 Next.js 의 prerender 단계에서
// Suspense 경계를 요구한다. 없으면 빌드가 CSR bailout 에러로 실패한다.
// 탭 바(tab bar-layout)는 margin/pc inset + 전폭 회색선을 위해 Container 밖에서 자체 레이아웃을 가지므로
// 여기서는 Container 로 감싸지 않고 ExploreContent 가 직접 레이아웃을 구성한다.
const ExplorePage = () => {
  return (
    <Suspense fallback={null}>
      <ExploreContent />
    </Suspense>
  )
}

export default ExplorePage
