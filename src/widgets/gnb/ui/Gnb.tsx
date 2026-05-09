'use client'

import { MenuIcon } from '@/shared/assets/icons'
import { LogoButton } from './LogoButton'
import { NavBar } from './NavBar'

const Gnb = () => {
  return (
    <header className="flex w-full items-center justify-center bg-white py-0 tab:py-[0.5rem]">
      <div className="flex w-full items-center justify-between px-[1.25rem] tab:px-[3rem] pc:px-[6.25rem]">
        <LogoButton />
        {/* PC: 네비게이션 */}
        <NavBar className="hidden tab:flex" />
        {/* 모바일: 햄버거 메뉴 */}
        <button className="flex size-[3rem] items-center justify-center tab:hidden" aria-label="메뉴 열기">
          <MenuIcon className="size-[1.5rem]" />
        </button>
      </div>
    </header>
  )
}

export { Gnb }
