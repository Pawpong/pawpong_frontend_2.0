'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { activityConfigOptions } from '@/entities/gamification'
import { useAuthStatus } from '@/shared/lib/useAuthStatus'
import { MobileSupportInquiry } from '@/features/inquiry'
import { cn } from '@/shared/lib/cn'
import {
  Dialog,
  DialogBareContent,
  DialogBareTitle,
  DialogClose,
  DialogOverlay,
  DialogPortal,
  iconButtonVariants,
} from '@/shared/ui'
import { LogoButton } from './LogoButton'
import { AuthActions } from './AuthActions'
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
  const hrefFor = ({ href, requiresAuth }: NavItem) =>
    requiresAuth && !isLoggedIn ? `/login?returnUrl=${encodeURIComponent(href)}` : href
  // 메뉴는 GNB 에 늘 붙어 있어 열렸을 때만 조회한다 — 닫혀 있는 동안 모든 화면에서 설정을 주기 조회하지 않게
  const activityConfig = useQuery({ ...activityConfigOptions, enabled: open })
  const activityEnabled = !!activityConfig.data?.enabled && !activityConfig.isError
  const items = MOBILE_MENU_ITEMS.filter((item) => activityEnabled || !item.requiresActivity)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        {/* mo·tab 은 전체화면 시트라 뒤 페이지가 비치지 않게 불투명 base 를 깐다.
            pc 는 우측 상단 드롭다운이라 화면을 가리지 않고 흐릿한 딤만 둔다. */}
        <DialogOverlay className="bg-base-white lap:bg-neutral-850/20" />
        <DialogBareContent
          aria-describedby={undefined}
          className={cn(
            'fixed inset-0 z-modal flex min-w-0 flex-col overflow-y-auto bg-white',
            'data-[state=closed]:opacity-0 data-[state=open]:opacity-100',
            // 앱 탭 바는 WebView 위에 앱이 그려 z-index 로 덮을 수 없다. 탭 바 높이(BottomNav 빈 자리와 같은 값)만큼
            // 아래를 비워 맨 아래 로그아웃이 가려지지 않게 한다.
            'in-data-native-tabs:pb-[calc(4.75rem+env(safe-area-inset-bottom))]',
            // pc: 링크 8개 때문에 1440px 화면을 통째로 덮을 이유가 없다 — 우측 상단 패널로 띄운다.
            // right 는 뷰포트가 페이지 틀보다 넓을 때 ☰ 버튼을 따라가도록 틀의 우측 여백 기준으로 계산한다:
            // max(여백, (100vw - 틀 폭)/2 + 여백)
            'lap:inset-auto lap:top-[4.5rem] lap:right-[max(var(--page-gutter),calc(50vw_-_var(--page-max-width)/2_+_var(--page-gutter)))] lap:h-auto lap:w-[18rem] lap:rounded-2xl lap:border lap:border-neutral-150 lap:shadow-[0_12px_24px_rgba(55,55,55,0.12)]',
          )}
        >
          <DialogBareTitle className="sr-only">전체 메뉴</DialogBareTitle>
          {/* QA: border-b 제거 */}
          <header className="sticky top-0 z-10 bg-white lap:hidden">
            <div className="page-shell flex h-12 items-center justify-between tab:h-16">
              {/* 다른 메뉴 항목과 같이 이동하면서 시트도 닫는다 — 안 닫으면 홈으로 가도 메뉴가 덮는다 */}
              <LogoButton onNavigate={close} />
              <div className="flex items-center gap-2">
                <AuthActions placement="menu-header" />
                <DialogClose
                  className={iconButtonVariants({ tone: 'muted' })}
                  aria-label="메뉴 닫기"
                >
                  <Image src="/images/nav/menu-close.svg" alt="" width={24} height={24} />
                </DialogClose>
              </div>
            </div>
          </header>

          {/* Figma 3555:416834 — 카드 없이 항목만 32px 간격으로 세운다 (본문 px16 / py40) */}
          {/* pc 는 18rem 패널이라 여백만 20px 로 줄인다 */}
          <div className="page-shell flex flex-1 flex-col gap-8 py-10 lap:gap-5 lap:py-5 lap:[--page-gutter:1.25rem]">
            <nav className="flex flex-col gap-8 lap:gap-4" aria-label="설정">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={hrefFor(item)}
                  onClick={close}
                  className="text-base leading-[1.5] font-semibold text-neutral-700 focus-ring transition-colors hover:text-primary-500 focus-visible:rounded"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            {/* pc 는 드롭다운이라 뒤로 헤더가 그대로 보인다 — 헤더에 이미 있는 로그아웃을 또 두지 않는다.
                mo·tab 은 전체화면 시트가 헤더를 덮으므로 여기에도 있어야 한다. */}
            <div className="flex flex-1 items-end justify-center lap:hidden">
              <AuthActions placement="menu-footer" />
            </div>
          </div>
          <MobileSupportInquiry audience={userRole === 'breeder' ? 'breeder' : 'adopter'} />
        </DialogBareContent>
      </DialogPortal>
    </Dialog>
  )
}

export { MobileMenu }
