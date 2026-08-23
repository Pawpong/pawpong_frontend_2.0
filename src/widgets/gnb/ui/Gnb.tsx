'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { MenuIcon } from '@/shared/assets'
import { PAGE_WIDTH_CLASS } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { LogoButton } from './LogoButton'
import { NavBar } from './NavBar'
import { AuthActions } from './AuthActions'
import { MobileMenu } from './MobileMenu'

const Gnb = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const isChat = pathname.startsWith('/chat')

  return (
    <>
      {/* 높이·좌우 여백은 Figma 740-66523 디바이스 프레임 기준
          (mo-375 h48/px16 · tab-768 py8/px48 · pc-1440 h64/py8/px80) */}
      <header
        data-gnb
        className="sticky top-0 z-50 flex h-12 w-full items-center justify-center bg-white tab:py-2 pc:h-16"
      >
        <div
          className={cn(
            PAGE_WIDTH_CLASS,
            'flex items-center justify-between px-4 tab:px-12 pc:px-20',
          )}
        >
          <LogoButton />
          {/* 오른쪽 그룹: nav + 로그인/회원가입 + 햄버거를 한 덩어리로 묶어 로고와만 justify-between (Figma 1555-88214) */}
          <div className="flex items-center gap-[1.25rem]">
            {/* 데스크탑: 네비게이션(탐색/채팅/커뮤니티/마이홈) + 로그인 상태별 액션 */}
            <div className="hidden items-center gap-[1.25rem] pc:flex">
              <NavBar chatTone={isChat} />
              {!isChat && <AuthActions variant="inline" />}
            </div>
            {/* 햄버거 메뉴 — 탭·모바일은 nav 대체, 데스크탑은 보조 메뉴 (전 브레이크포인트) */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex size-12 items-center justify-center"
              aria-label="메뉴 열기"
            >
              {/* Figma icon/menu — colors/icon/interactive/main color/Primary (#ad651d) */}
              <MenuIcon className="size-6 text-primary-500" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </>
  )
}

export { Gnb }
