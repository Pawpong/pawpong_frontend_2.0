'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/shared/lib/Cn'

const TAB_ITEMS = [
  { name: '홈', href: '/' },
  { name: '탐색', href: '/explore' },
  { name: '채팅', href: '/chat' },
  { name: '커뮤니티', href: '/community' },
  { name: '마이홈', href: '/home' },
]

const BottomTabBar = () => {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-between bg-[#ebebeb] px-[1.25rem] py-[0.75rem] tab:hidden">
      {TAB_ITEMS.map((item) => {
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'text-[0.875rem] leading-[1.5] text-[rgba(18,18,18,0.5)]',
              isActive && 'text-[#121212]',
            )}
          >
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}

export { BottomTabBar }
