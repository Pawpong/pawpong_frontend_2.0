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
      // cursor-pointer 를 명시한다 — 로고 위에서 손 모양 대신 텍스트 커서(I)가 뜬다는 제보가 있었다.
      // a[href] 면 UA 기본값이 pointer 라 원래는 불필요하지만, 눌리는 요소라는 신호를 브라우저
      // 기본값에 맡기지 않고 고정한다(DropdownMenu·Switch 등도 같은 이유로 명시하고 있다).
      className="flex min-h-10 cursor-pointer items-center rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
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
