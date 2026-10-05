import { createPageMetadata } from '@/shared/lib/metadata'

import { Suspense } from 'react'
import { MyHomeContent } from './_ui/MyHomeContent'

export const metadata = createPageMetadata({ title: '마이홈', noIndex: true })

// MyHomeContent 가 ?tab= 을 읽으므로(useSearchParams) Suspense 경계가 필요하다
const MyHomePage = () => {
  return (
    <Suspense>
      <MyHomeContent />
    </Suspense>
  )
}

export default MyHomePage
