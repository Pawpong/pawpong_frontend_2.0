'use client'

import Link from 'next/link'
import { type MouseEvent } from 'react'
import { usePathname } from 'next/navigation'
import { useNavigationGuardContext } from '@/shared/lib/NavigationGuardContext'

const LogoButton = () => {
  const pathname = usePathname()
  const guardContext = useNavigationGuardContext()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!guardContext?.guardNavigation || pathname === '/') return
    e.preventDefault()
    guardContext.guardNavigation('/')
  }

  return (
    <Link href="/" className="text-xl font-bold" aria-label="홈으로 이동" onClick={handleClick}>
      Pawpong
    </Link>
  )
}

export { LogoButton }
