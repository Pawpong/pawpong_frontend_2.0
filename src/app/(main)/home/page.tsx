import { Suspense } from 'react'
import { MyHomeContent } from './_ui/MyHomeContent'

// MyHomeContent 내부에서 useSearchParams 를 사용하므로 Next.js 의 prerender 단계에서
// Suspense 경계를 요구한다. 없으면 빌드가 CSR bailout 에러로 실패한다.
const MyHomePage = () => {
  return (
    <Suspense fallback={null}>
      <MyHomeContent />
    </Suspense>
  )
}

export default MyHomePage
