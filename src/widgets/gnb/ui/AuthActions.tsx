'use client'

import Link from 'next/link'
import { cn } from '@/shared/lib/cn'
import { useAuthStatus, useLogoutAndRedirect } from '@/features/auth'

interface AuthActionsProps {
  className?: string
}

const PILL = 'rounded-full px-4 py-2 text-center text-sm transition-colors'

/**
 * [refactored] GNB 인증 액션 — 비로그인 로그인 버튼 / 로그인 로그아웃 버튼.
 * 노출 조건(쿠키를 읽기 전에는 그리지 않는다)을 여기서 판단해 헤더·nav 가 같은 분기를 복제하지 않게 한다.
 * 소셜 전용 서비스라 가입도 /login 에서 시작하므로 회원가입 버튼을 따로 두지 않는다.
 */
const AuthActions = ({ className }: AuthActionsProps) => {
  const { isReady, isLoggedIn } = useAuthStatus()
  const { logoutAndRedirect, isPending: isLoggingOut } = useLogoutAndRedirect()

  // 서버 렌더는 항상 비로그인이라, 쿠키를 읽기 전에 그리면 로그인 사용자에게 버튼이 스쳤다 사라진다
  if (!isReady) return null

  if (isLoggedIn) {
    return (
      <button
        type="button"
        onClick={logoutAndRedirect}
        disabled={isLoggingOut}
        // 로그아웃: 요청 성공/실패와 무관하게 이동 직전 쿠키를 다시 지우고 홈으로 하드 내비게이션한다
        className={cn(
          PILL,
          'border border-neutral-500 font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50',
          className,
        )}
      >
        로그아웃
      </button>
    )
  }

  return (
    <Link
      href="/login"
      className={cn(
        PILL,
        'bg-point-500 font-semibold text-neutral-850 hover:bg-point-300',
        className,
      )}
    >
      로그인
    </Link>
  )
}

export { AuthActions }
