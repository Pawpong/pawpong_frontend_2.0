'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MenuIcon } from '@/shared/assets/icons'
import { useAuthStatus, useLogout } from '@/features/auth'
import { LogoButton } from './LogoButton'
import { NavBar } from './NavBar'
import { MobileMenu } from './MobileMenu'

const Gnb = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isLoggedIn } = useAuthStatus()
  const { mutate: logout, isPending: isLoggingOut } = useLogout()

  // 로그아웃: 쿠키 정리(성공/실패 무관) 후 홈으로 하드 내비게이션 → GNB 가 비로그인 상태로 갱신
  const handleLogout = () => {
    logout(undefined, { onSettled: () => window.location.assign('/') })
  }

  return (
    <>
      <header
        data-gnb
        className="sticky top-0 z-50 flex w-full items-center justify-center bg-white py-0 tab:py-[0.5rem]"
      >
        <div className="flex w-full items-center justify-between px-[1.25rem] tab:px-[3rem] pc:px-[6.25rem]">
          <LogoButton />
          {/* PC: 네비게이션 + 로그인 상태별 액션 (로그인 시 로그아웃 / 비로그인 시 로그인·회원가입) */}
          <div className="hidden items-center gap-[1.75rem] tab:flex">
            <NavBar />
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="rounded-full border border-[#a8a8a8] px-4 py-2 text-sm font-medium text-[#666] transition-colors hover:bg-[#f5f5f5] disabled:opacity-50"
                >
                  로그아웃
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-full border border-[#a8a8a8] px-4 py-2 text-sm font-medium text-[#666] transition-colors hover:bg-[#f5f5f5]"
                  >
                    로그인
                  </Link>
                  {/* 소셜 전용 서비스 — 회원가입도 /login(소셜 인증)에서 시작, 신규 유저는 백엔드가 /signup?tempId=...로 보냄 */}
                  <Link
                    href="/login"
                    className="rounded-full bg-[#fffa94] px-4 py-2 text-sm font-semibold text-[#3e3e3e] transition-colors hover:bg-[#fff066]"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
          {/* 모바일: 햄버거 메뉴 */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex size-12 items-center justify-center tab:hidden"
            aria-label="메뉴 열기"
          >
            <MenuIcon className="size-6" />
          </button>
        </div>
      </header>

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </>
  )
}

export { Gnb }
