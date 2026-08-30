'use client'

import Image from 'next/image'
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
    <Link
      href="/"
      aria-label="홈으로 이동"
      onClick={handleClick}
      className="flex min-h-10 items-center rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
    >
      {/* Figma 로고 (742:67105) — mo 28px / tab+ 32px 높이, 폭은 비율 유지 */}
      <Image
        src="/logo.svg"
        alt="Pawpong"
        width={96}
        height={32}
        priority
        className="h-7 w-auto tab:h-8"
      />
    </Link>
  )
}

export { LogoButton }
