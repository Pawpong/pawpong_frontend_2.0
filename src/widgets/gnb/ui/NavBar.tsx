'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type MouseEvent } from 'react'
import { cn } from '@/shared/lib/Cn'
import { useNavigationGuardContext } from '@/shared/lib/NavigationGuardContext'
import { HomeIcon } from '@/shared/assets/icons'
import { NAV_ITEMS } from './NavItems'

const NavBar = ({ className }: { className?: string }) => {
  const pathname = usePathname()
  const guardContext = useNavigationGuardContext()

  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!guardContext?.guardNavigation || pathname === href) return
    e.preventDefault()
    guardContext.guardNavigation(href)
  }

  return (
    <nav className={cn('flex items-center gap-[1.75rem]', className)}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname.startsWith(item.href)

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={(e) => handleLinkClick(e, item.href)}
            className={cn(
              'flex items-center text-[1rem] font-medium text-[#666] transition-colors',
              isActive && 'text-primary-500 font-semibold',
            )}
          >
            <div className="flex size-[3rem] items-center justify-center">
              <HomeIcon className="size-[1.5rem]" />
            </div>
            <div className="flex h-[3rem] items-center justify-center px-[0.625rem]">
              {item.name}
            </div>
          </Link>
        )
      })}
    </nav>
  )
}

export { NavBar }
