'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/shared/lib/cn'
import { MAIN_NAV } from '@/shared/config/mainNav'
import { PAGE_WIDTH_CLASS } from '@/shared/config/layout'

/** 모바일·탭 하단 고정 네비게이션 (pc는 상단 GNB 사용). 아이콘·목적지는 shared/config/mainNav 공유 */
const BottomNav = () => {
  const pathname = usePathname()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ededed] bg-white pc:hidden">
      <div
        className={cn(PAGE_WIDTH_CLASS, 'flex items-center justify-between px-4 py-3 tab:px-12')}
      >
        {MAIN_NAV.map(({ href, label, Icon, isActive }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-[0.125rem]',
              isActive(pathname) ? 'text-[#3e3e3e]' : 'text-[#a6a6a6]',
            )}
          >
            <Icon className="size-8" />
            <span className="text-sm leading-[1.5] font-semibold">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

export { BottomNav }
