'use client'

import Link from 'next/link'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { ArrowRightIcon, CloseIcon } from '@/shared/assets'
import { RESPONSIVE_SHELL_CLASS } from '@/shared/config'
import { useAuthStatus } from '@/features/auth'
import { cn } from '@/shared/lib/cn'
import { Dialog, DialogPortal } from '@/shared/ui'
import { LogoButton } from './LogoButton'
import { AuthActions } from './AuthActions'
import { MOBILE_ACCOUNT_MENU_ITEMS, MOBILE_PUBLIC_MENU_ITEMS } from './NavItems'
import type { NavItem } from './NavItems'

interface MobileMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface MenuGroupProps {
  label: string
  items: NavItem[]
  onNavigate: () => void
}

const MenuGroup = ({ label, items, onNavigate }: MenuGroupProps) => (
  <section className="overflow-hidden rounded-xl border border-neutral-150 bg-white shadow-[0_7px_7px_rgba(55,55,55,0.06)]">
    <h2 className="px-4 pt-4 pb-2 font-cafe24 text-sm text-primary-600 tab:px-5 tab:text-base">
      {label}
    </h2>
    <nav className="divide-y divide-neutral-150" aria-label={label}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className="group flex min-h-14 items-center justify-between gap-4 px-4 py-3 text-base font-semibold text-neutral-850 transition-colors hover:bg-primary-50/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500 tab:min-h-16 tab:px-5"
        >
          {item.name}
          <ArrowRightIcon className="size-5 shrink-0 text-neutral-500 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-500" />
        </Link>
      ))}
    </nav>
  </section>
)

const MobileMenu = ({ open, onOpenChange }: MobileMenuProps) => {
  const { isLoggedIn } = useAuthStatus()
  const close = () => onOpenChange(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-modal flex min-w-0 flex-col overflow-y-auto bg-primary-50/20 data-[state=closed]:opacity-0 data-[state=open]:opacity-100"
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

          <div
            className={cn(
              RESPONSIVE_SHELL_CLASS,
              'flex flex-1 flex-col gap-5 px-4 py-6 tab:gap-6 tab:px-12 tab:py-10 pc:px-20',
            )}
          >
            <AuthActions variant="block" onNavigate={close} />
            <MenuGroup label="서비스" items={MOBILE_PUBLIC_MENU_ITEMS} onNavigate={close} />
            {isLoggedIn && (
              <MenuGroup label="내 메뉴" items={MOBILE_ACCOUNT_MENU_ITEMS} onNavigate={close} />
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}

export { MobileMenu }
