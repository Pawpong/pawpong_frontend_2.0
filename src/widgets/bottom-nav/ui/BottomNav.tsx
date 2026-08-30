'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/shared/lib/cn'
import { MAIN_NAV } from '@/shared/config'

const BOTTOM_NAV_PATHS = new Set(['/', '/explore', '/chat', '/community', '/home'])

const BottomNavView = ({ pathname }: { pathname: string }) => (
  <>
    <div aria-hidden className="h-[calc(3.5rem+env(safe-area-inset-bottom))] shrink-0 pc:hidden" />
    <nav
      aria-label="하단 주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-sticky h-[calc(3.5rem+env(safe-area-inset-bottom))] bg-white pb-[env(safe-area-inset-bottom)] pc:hidden"
    >
      <div className="mx-auto flex h-14 w-full max-w-[48rem] items-center">
        {MAIN_NAV.map(({ href, label, bottomLabel, Icon, isActive }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'relative flex h-12 min-w-0 flex-1 flex-col items-center justify-center text-neutral-500 transition-colors hover:text-primary-500 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary-500',
              isActive(pathname) && 'font-bold text-primary-500',
            )}
            aria-current={isActive(pathname) ? 'page' : undefined}
          >
            <Icon className="size-[1.875rem] shrink-0" />
            <span
              className={cn(
                'text-xs leading-[1.5]',
                isActive(pathname) ? 'font-bold' : 'font-medium',
              )}
            >
              {bottomLabel ?? label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  </>
)

/**
 * Figma navbar(4042:780810) — mo·tab 56px, 5개 항목을 같은 폭으로 배치한다.
 * 작성·상세·채팅방처럼 자체 하단 액션이 있는 화면에서는 렌더하지 않는다.
 */
const BottomNavContent = ({ pathname }: { pathname: string }) => {
  const searchParams = useSearchParams()
  const isChatRoom = pathname === '/chat' && searchParams.has('roomId')

  if (isChatRoom) return null

  return <BottomNavView pathname={pathname} />
}

const BottomNav = () => {
  const pathname = usePathname()

  if (!BOTTOM_NAV_PATHS.has(pathname)) return null

  return (
    <Suspense fallback={pathname === '/chat' ? null : <BottomNavView pathname={pathname} />}>
      <BottomNavContent pathname={pathname} />
    </Suspense>
  )
}

export { BottomNav }
