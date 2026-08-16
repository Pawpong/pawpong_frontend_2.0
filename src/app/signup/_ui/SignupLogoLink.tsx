'use client'

import Image from 'next/image'
import Link from 'next/link'
import { type MouseEvent } from 'react'
import { useNavigationGuardContext } from '@/shared/lib/NavigationGuardContext'

/**
 * 가입 헤더의 로고 — 온보딩을 벗어나는 유일한 링크라 이탈 확인을 거친다.
 * (GNB LogoButton 과 같은 역할이지만 가입 화면은 GNB 를 쓰지 않고 자체 헤더를 둔다)
 */
const SignupLogoLink = () => {
  const guardContext = useNavigationGuardContext()

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!guardContext?.guardNavigation) return
    event.preventDefault()
    guardContext.guardNavigation('/')
  }

  return (
    <Link href="/" aria-label="홈으로 이동" onClick={handleClick}>
      <Image src="/images/logo/logo.svg" alt="Pawpong" width={96} height={32} priority />
    </Link>
  )
}

export { SignupLogoLink }
