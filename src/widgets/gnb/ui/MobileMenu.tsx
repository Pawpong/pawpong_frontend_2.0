'use client'

import Link from 'next/link'
import { CloseIcon } from '@/shared/assets/icons'
import { useAuthStatus, useLogout } from '@/features/auth'
import { LogoButton } from './LogoButton'
import { MOBILE_MENU_ITEMS } from './NavItems'

interface MobileMenuProps {
  onClose: () => void
}

const MobileMenu = ({ onClose }: MobileMenuProps) => {
  const { isLoggedIn } = useAuthStatus()
  const { mutate: logout, isPending: isLoggingOut } = useLogout()

  // 로그아웃: 쿠키 정리 후 홈으로 하드 내비게이션 → 비로그인 상태로 갱신
  const handleLogout = () => {
    onClose()
    logout(undefined, { onSettled: () => window.location.assign('/') })
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white tab:hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5">
        <LogoButton />
        <button
          type="button"
          onClick={onClose}
          className="flex size-12 items-center justify-center"
          aria-label="메뉴 닫기"
        >
          <CloseIcon className="size-6" />
        </button>
      </div>

      {/* 로그인 상태별 액션 (로그인 시 로그아웃 / 비로그인 시 로그인·회원가입) */}
      <div className="flex gap-3 px-[2.701rem] pt-[2.438rem]">
        {isLoggedIn ? (
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex-1 rounded-full border border-[#a8a8a8] py-3 text-center text-base font-medium text-[#666] disabled:opacity-50"
          >
            로그아웃
          </button>
        ) : (
          <>
            <Link
              href="/login"
              onClick={onClose}
              className="flex-1 rounded-full border border-[#a8a8a8] py-3 text-center text-base font-medium text-[#666]"
            >
              로그인
            </Link>
            {/* 소셜 전용 서비스 — 회원가입도 /login(소셜 인증)에서 시작, 신규 유저는 백엔드가 /signup?tempId=...로 보냄 */}
            <Link
              href="/login"
              onClick={onClose}
              className="flex-1 rounded-full bg-[#fffa94] py-3 text-center text-base font-semibold text-[#3e3e3e]"
            >
              회원가입
            </Link>
          </>
        )}
      </div>

      {/* 메뉴 항목 */}
      <nav className="flex flex-col px-[2.701rem] pt-[1.5rem]">
        {MOBILE_MENU_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="py-3 text-xl font-semibold text-black"
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export { MobileMenu }
