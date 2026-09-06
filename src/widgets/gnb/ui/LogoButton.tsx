'use client'

import Image from 'next/image'
import Link from 'next/link'
import { type MouseEvent } from 'react'
import { usePathname } from 'next/navigation'
import { useNavigationGuardContext } from '@/shared/lib/NavigationGuardContext'

interface LogoButtonProps {
  /** 이동 직전 호출 — 전체 메뉴처럼 열려 있는 오버레이를 닫을 때 쓴다 */
  onNavigate?: () => void
}

const LogoButton = ({ onNavigate }: LogoButtonProps) => {
  const pathname = usePathname()
  const guardContext = useNavigationGuardContext()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onNavigate?.()
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
