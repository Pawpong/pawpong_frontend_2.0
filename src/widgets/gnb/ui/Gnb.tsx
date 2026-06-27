'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MenuIcon } from '@/shared/assets/icons'
import { LogoButton } from './LogoButton'
import { NavBar } from './NavBar'
import { MobileMenu } from './MobileMenu'

const Gnb = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header
        data-gnb
        className="sticky top-0 z-50 flex w-full items-center justify-center bg-white py-0 tab:py-[0.5rem]"
      >
        <div className="flex w-full items-center justify-between px-[1.25rem] tab:px-[3rem] pc:px-[6.25rem]">
          <LogoButton />
          {/* PC: 네비게이션 + 로그인/회원가입 */}
          <div className="hidden items-center gap-[1.75rem] tab:flex">
            <NavBar />
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-full border border-[#a8a8a8] px-4 py-2 text-sm font-medium text-[#666] transition-colors hover:bg-[#f5f5f5]"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[#fffa94] px-4 py-2 text-sm font-semibold text-[#3e3e3e] transition-colors hover:bg-[#fff066]"
              >
                회원가입
              </Link>
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
