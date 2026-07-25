'use client'

import { useState } from 'react'
import { MenuIcon } from '@/shared/assets/icons'
import { LogoButton } from './LogoButton'
import { NavBar } from './NavBar'
import { AuthActions } from './AuthActions'
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
          {/* 오른쪽 그룹: nav + 로그인/회원가입 + 햄버거를 한 덩어리로 묶어 로고와만 justify-between (Figma 1555-88214) */}
          <div className="flex items-center gap-[1.25rem]">
            {/* 데스크탑: 네비게이션(탐색/채팅/커뮤니티/마이홈) + 로그인 상태별 액션 */}
            <div className="hidden items-center gap-[1.25rem] pc:flex">
              <NavBar />
              <AuthActions variant="inline" />
            </div>
            {/* 햄버거 메뉴 — 탭·모바일은 nav 대체, 데스크탑은 보조 메뉴 (전 브레이크포인트) */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex size-12 items-center justify-center"
              aria-label="메뉴 열기"
            >
              <MenuIcon className="size-6" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </>
  )
}

export { Gnb }
