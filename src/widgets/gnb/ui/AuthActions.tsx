'use client'

import Link from 'next/link'
import { cn } from '@/shared/lib/cn'
import { useAuthStatus, useLogoutAndRedirect } from '@/features/auth'
import { AuthMenuIcon } from './AuthMenuIcon'

interface AuthActionsProps {
  className?: string
  placement?: 'header' | 'header-mobile' | 'menu-header' | 'menu-footer'
}

const AUTH_ITEM =
  'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg px-1.5 text-sm leading-[1.5] font-semibold whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 tab:gap-2 tab:px-2 tab:text-base'

const HEADER_AUTH_ITEM =
  'gap-0 rounded pr-1 pl-0 text-sm font-medium hover:bg-transparent tab:gap-0 tab:pr-1 tab:pl-0 tab:text-sm'

/**
 * [refactored] GNB 인증 액션 — 비로그인 로그인 버튼 / 로그인 로그아웃 버튼.
 * 노출 조건(쿠키를 읽기 전에는 그리지 않는다)을 여기서 판단해 헤더·nav 가 같은 분기를 복제하지 않게 한다.
 * 소셜 전용 서비스라 가입도 /login 에서 시작하므로 회원가입 버튼을 따로 두지 않는다.
 */
const AuthActions = ({ className, placement = 'header' }: AuthActionsProps) => {
  const { isReady, isLoggedIn } = useAuthStatus()
  const { logoutAndRedirect, isPending: isLoggingOut } = useLogoutAndRedirect()

  // 서버 렌더는 항상 비로그인이라, 쿠키를 읽기 전에 그리면 로그인 사용자에게 버튼이 스쳤다 사라진다
  if (!isReady) return null
  // 로그아웃 버튼은 pc 헤더(NavBar)와 전체메뉴 푸터에만 둔다. mo·tab 헤더와 전체메뉴 헤더는
  // 로그인 사용자에게 아무것도 그리지 않는다 — 좁은 헤더를 밀어내고, 로그아웃은 메뉴 푸터에 있다.
  const showsLogout = placement === 'header' || placement === 'menu-footer'
  if (isLoggedIn && !showsLogout) return null
  if (!isLoggedIn && placement === 'menu-footer') return null

  // [refactored] 로그인/로그아웃 분기가 같은 계산을 두 벌 갖고 있던 것을 하나로
  const itemClass = cn(AUTH_ITEM, placement === 'header' && HEADER_AUTH_ITEM)
  const iconClass = placement === 'header' ? 'size-7.5 shrink-0' : 'size-6 shrink-0'

  if (isLoggedIn) {
    return (
      <button
        type="button"
        onClick={logoutAndRedirect}
        disabled={isLoggingOut}
        // 로그아웃: 요청 성공/실패와 무관하게 이동 직전 쿠키를 다시 지우고 홈으로 하드 내비게이션한다
        className={cn(
          itemClass,
          'disabled:cursor-not-allowed disabled:text-neutral-300',
          placement === 'menu-footer' &&
            'h-14 w-full justify-start rounded-none border-t-2 border-primary-500 px-1 text-base',
          className,
        )}
      >
        <AuthMenuIcon direction="logout" className={iconClass} />
        <span>{isLoggingOut ? '로그아웃 중' : '로그아웃'}</span>
      </button>
    )
  }

  return (
    <Link href="/login" className={cn(itemClass, className)}>
      <AuthMenuIcon direction="login" className={iconClass} />
      <span>로그인</span>
    </Link>
  )
}

export { AuthActions }
