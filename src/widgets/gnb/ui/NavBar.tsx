'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type MouseEvent } from 'react'
import { cn } from '@/shared/lib/cn'
import { useNavigationGuardContext } from '@/shared/lib/NavigationGuardContext'
import { HEADER_NAV } from '@/shared/config'

interface NavBarProps {
  className?: string
}

const NavBar = ({ className }: NavBarProps) => {
  const pathname = usePathname()
  const guardContext = useNavigationGuardContext()

  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!guardContext?.guardNavigation || pathname === href) return
    e.preventDefault()
    guardContext.guardNavigation(href)
  }

  return (
    <nav className={cn('items-center gap-7', className)} aria-label="주요 메뉴">
      {/* 아이콘·목적지는 BottomNav와 shared/config/mainNav 공유 (Figma NavBar 1596-97648) */}
      {HEADER_NAV.map(({ href, label, Icon, isActive }) => (
        <Link
          key={href}
          href={href}
          onClick={(e) => handleLinkClick(e, href)}
          className={cn(
            'flex items-center text-sm leading-[1.5] font-medium whitespace-nowrap text-primary-500 transition-colors hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
            isActive(pathname) && 'font-semibold text-primary-700',
          )}
          aria-current={isActive(pathname) ? 'page' : undefined}
        >
          <Icon className="size-7.5" />
          {label}
        </Link>
      ))}
    </nav>
  )
}

export { NavBar }
