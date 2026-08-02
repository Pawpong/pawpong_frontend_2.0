'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type MouseEvent } from 'react'
import { cn } from '@/shared/lib/cn'
import { useNavigationGuardContext } from '@/shared/lib/NavigationGuardContext'
import { HEADER_NAV } from '@/shared/config/mainNav'
import { NotificationBell } from './NotificationBell'

const NavBar = ({ className }: { className?: string }) => {
  const pathname = usePathname()
  const guardContext = useNavigationGuardContext()

  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!guardContext?.guardNavigation || pathname === href) return
    e.preventDefault()
    guardContext.guardNavigation(href)
  }

  return (
    <nav className={cn('flex items-center gap-[1.25rem]', className)}>
      {/* 아이콘·목적지는 BottomNav와 shared/config/mainNav 공유 (Figma NavBar 1596-97648) */}
      {HEADER_NAV.map(({ href, label, Icon, isActive }) => (
        <Link
          key={href}
          href={href}
          onClick={(e) => handleLinkClick(e, href)}
          className={cn(
            'flex items-center text-[1rem] whitespace-nowrap transition-colors',
            isActive(pathname) ? 'font-semibold text-neutral-850' : 'font-medium text-neutral-500',
          )}
        >
          <Icon className="size-8" />
          {label}
        </Link>
      ))}
      {/* 알림 — 링크 대신 유튜브식 드롭다운 (test 통합 브랜치 기능 유지) */}
      <NotificationBell />
    </nav>
  )
}

export { NavBar }
