'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type MouseEvent } from 'react'
import { cn } from '@/shared/lib/cn'
import { useNavigationGuardContext } from '@/shared/lib/NavigationGuardContext'
import { HEADER_NAV } from '@/shared/config'
import { useAuthStatus, useMe } from '@/features/auth'
import { AuthActions } from './AuthActions'

interface NavBarProps {
  className?: string
}

const NavBar = ({ className }: NavBarProps) => {
  const pathname = usePathname()
  const { me } = useMe()
  // 쿠키를 읽기 전에는 서버 렌더와 같은 화면을 유지한다 (로그인 사용자에게 버튼이 깜빡이지 않도록)
  const { isReady, isLoggedIn } = useAuthStatus()
  // 비로그인은 마이홈 대신 로그인 버튼이 그 자리에 온다
  const items = isReady && !isLoggedIn ? HEADER_NAV.filter((i) => i.href !== '/home') : HEADER_NAV
  const guardContext = useNavigationGuardContext()

  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!guardContext?.guardNavigation || pathname === href) return
    e.preventDefault()
    guardContext.guardNavigation(href)
  }

  return (
    <nav className={cn('items-center gap-5', className)} aria-label="주요 메뉴">
      {/* 아이콘·목적지는 BottomNav와 shared/config/mainNav 공유 (Figma NavBar 1596-97648) */}
      {items.map(({ href, label, Icon, isActive }) => (
        <Link
          key={href}
          href={href}
          onClick={(e) => handleLinkClick(e, href)}
          className={cn(
            'flex items-center rounded pr-1 text-sm leading-[1.5] font-medium whitespace-nowrap text-primary-500 transition-colors hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
            // 활성: point-500 배경 칩 + semibold, 글자색은 primary-500 유지 (Figma 4042:722106)
            isActive(pathname) && 'bg-point-500 font-semibold',
          )}
          aria-current={isActive(pathname) ? 'page' : undefined}
        >
          <Icon
            className="size-7.5"
            src={href === '/home' ? me?.profileImageUrl : undefined}
            active={isActive(pathname)}
          />
          {label}
        </Link>
      ))}
      {/* [refactored] 노출 조건은 AuthActions 내부 판단 */}
      <AuthActions className="hidden pc:block" />
    </nav>
  )
}

export { NavBar }
