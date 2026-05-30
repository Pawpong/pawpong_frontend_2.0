import { Suspense } from 'react'
import { Container } from '@/shared/ui'
import { ExploreContent } from './_ui/ExploreContent'

// ExploreContent 내부에서 useSearchParams 를 사용하므로 Next.js 의 prerender 단계에서
// Suspense 경계를 요구한다. 없으면 빌드가 CSR bailout 에러로 실패한다.
const ExplorePage = () => {
  return (
    <Container>
      <Suspense fallback={null}>
        <ExploreContent />
      </Suspense>
    </Container>
  )
}

export default ExplorePage
