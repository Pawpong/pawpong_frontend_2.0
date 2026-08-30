'use client'

import { useState } from 'react'
import { MenuIcon } from '@/shared/assets'
import { RESPONSIVE_SHELL_CLASS } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { LogoButton } from './LogoButton'
import { NavBar } from './NavBar'
import { MobileMenu } from './MobileMenu'

const Gnb = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      {/* 높이·좌우 여백은 Figma 740-66523 디바이스 프레임 기준
          (mo-375 h48/px16 · tab-768 py8/px48 · pc-1440 h64/py8/px80) */}
      <header
        data-gnb
        className="sticky top-0 z-header flex h-12 w-full items-center justify-center bg-white tab:py-2 pc:h-16"
      >
        <div
          className={cn(
            RESPONSIVE_SHELL_CLASS,
            'flex items-center justify-between px-4 tab:px-12 pc:px-20',
          )}
        >
          <LogoButton />
          {/* Figma 3349:1763537 — PC nav와 메뉴 아이콘 사이 40px */}
          <div className="flex items-center gap-10">
            <NavBar className="hidden pc:flex" />
            {/* 햄버거 메뉴 — 탭·모바일은 nav 대체, 데스크탑은 보조 메뉴 (전 브레이크포인트) */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="-m-2 flex size-10 shrink-0 items-center justify-center rounded-lg text-primary-500 transition-colors hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              aria-label="메뉴 열기"
            >
              {/* Figma icon/menu — colors/icon/interactive/main color/Primary (#ad651d) */}
              <MenuIcon className="size-6" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  )
}

export { Gnb }
