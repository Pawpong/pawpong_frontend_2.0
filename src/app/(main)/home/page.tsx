import { Suspense } from 'react'
import { MyHomeContent } from './_ui/MyHomeContent'

// MyHomeContent 가 ?tab= 을 읽으므로(useSearchParams) Suspense 경계가 필요하다
const MyHomePage = () => {
  return (
    <Suspense>
      <MyHomeContent />
    </Suspense>
  )
}

export default MyHomePage
