'use client'

import Link from 'next/link'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { CloseIcon, PawIcon } from '@/shared/assets'
import { RESPONSIVE_SHELL_CLASS } from '@/shared/config'
import { useAuthStatus } from '@/features/auth'
import { cn } from '@/shared/lib/cn'
import { Dialog, DialogOverlay, DialogPortal } from '@/shared/ui'
import { LogoButton } from './LogoButton'
import { MOBILE_MENU_ITEMS } from './NavItems'
import type { NavItem } from './NavItems'

interface MobileMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MobileMenu = ({ open, onOpenChange }: MobileMenuProps) => {
  const { isLoggedIn, userRole } = useAuthStatus()
  const close = () => onOpenChange(false)
  // 인증이 필요한 화면도 목록에서 감추지 않고, 비로그인이면 돌아올 주소를 실어 로그인으로 보낸다
  const hrefFor = ({ href, breederHref, requiresAuth }: NavItem) => {
    const target = userRole === 'breeder' && breederHref ? breederHref : href
    return requiresAuth && !isLoggedIn ? `/login?returnUrl=${encodeURIComponent(target)}` : target
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        {/* 전체화면 시트라 Content 배경만으로는 뒤 페이지가 비친다 — 불투명 base 를 Overlay 로 깐다 */}
        <DialogOverlay className="bg-base-white" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-modal flex min-w-0 flex-col overflow-y-auto bg-white data-[state=closed]:opacity-0 data-[state=open]:opacity-100"
        >
          <DialogPrimitive.Title className="sr-only">전체 메뉴</DialogPrimitive.Title>

          <header className="sticky top-0 z-10 border-b border-neutral-150 bg-white">
            <div
              className={cn(
                RESPONSIVE_SHELL_CLASS,
                'flex h-12 items-center justify-between px-4 tab:h-16 tab:px-12 pc:px-20',
              )}
            >
              <LogoButton />
              <DialogPrimitive.Close
                className="flex size-10 items-center justify-center rounded-lg text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-850 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                aria-label="메뉴 닫기"
              >
                <CloseIcon className="size-6" />
              </DialogPrimitive.Close>
            </div>
          </header>

          {/* Figma 3555:416834 — 카드 없이 항목만 32px 간격으로 세운다 (본문 px16 / py40) */}
          <div
            className={cn(
              RESPONSIVE_SHELL_CLASS,
              'flex flex-1 flex-col gap-8 px-4 py-10 tab:px-12 pc:px-20',
            )}
          >
            <h2 className="flex items-center gap-1 text-base leading-[1.5] font-bold text-primary-500">
              <PawIcon className="size-8 shrink-0" aria-hidden />
              설정
            </h2>

            <nav className="flex flex-col gap-8" aria-label="설정">
              {MOBILE_MENU_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={hrefFor(item)}
                  onClick={close}
                  className="text-base leading-[1.5] font-semibold text-neutral-700 transition-colors hover:text-primary-500 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}

export { MobileMenu }
