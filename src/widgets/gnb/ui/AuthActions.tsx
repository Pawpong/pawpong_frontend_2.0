'use client'

import Link from 'next/link'
import { cn } from '@/shared/lib/cn'
import { useAuthStatus, useLogout } from '@/features/auth'

// 로그인/회원가입/로그아웃 액션 — GNB(inline pill)와 MobileMenu(block 전체폭)가 공유
const SIZE = {
  inline: 'px-4 py-2 text-sm',
  block: 'flex-1 py-3 text-base',
} as const

interface AuthActionsProps {
  variant?: keyof typeof SIZE
  /** 링크/로그아웃 클릭 시 (메뉴 닫기 등) */
  onNavigate?: () => void
  className?: string
}

const AuthActions = ({ variant = 'inline', onNavigate, className }: AuthActionsProps) => {
  const { isLoggedIn } = useAuthStatus()
  const { mutate: logout, isPending: isLoggingOut } = useLogout()

  // 로그아웃: 쿠키 정리(성공/실패 무관) 후 홈으로 하드 내비게이션 → 비로그인 상태로 갱신
  const handleLogout = () => {
    onNavigate?.()
    logout(undefined, { onSettled: () => window.location.assign('/') })
  }

  const pill = cn(SIZE[variant], 'rounded-full text-center transition-colors')
  const outline = cn(
    pill,
    'border border-[#a8a8a8] font-medium text-[#666]',
    variant === 'inline' && 'hover:bg-[#f5f5f5]',
  )

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {isLoggedIn ? (
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(outline, 'disabled:opacity-50')}
        >
          로그아웃
        </button>
      ) : (
        <>
          <Link href="/login" onClick={onNavigate} className={outline}>
            로그인
          </Link>
          {/* 소셜 전용 서비스 — 회원가입도 /login(소셜 인증)에서 시작, 신규 유저는 백엔드가 /signup?tempId=...로 보냄 */}
          <Link
            href="/login"
            onClick={onNavigate}
            className={cn(
              pill,
              'bg-[#fffa94] font-semibold text-[#3e3e3e]',
              variant === 'inline' && 'hover:bg-[#fff066]',
            )}
          >
            회원가입
          </Link>
        </>
      )}
    </div>
  )
}

export { AuthActions }
