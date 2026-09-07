'use client'

import { useAuthStatus } from '@/features/auth'
import { Container, CtaBanner } from '@/shared/ui'

const HomeCta = () => {
  const { isReady, isLoggedIn, userRole } = useAuthStatus()

  if (!isReady || (isLoggedIn && userRole !== 'breeder')) return null

  return (
    <Container className="px-4 py-3 tab:py-2">
      <CtaBanner
        text={isLoggedIn ? '분양 페이지로 바로가기' : '신뢰할 수 있는 브리더 포퐁에서 만나요 !'}
        href={isLoggedIn ? '/adoption/my-listings' : '/explore?type=breeder'}
        tone="point"
      />
    </Container>
  )
}

export { HomeCta }
