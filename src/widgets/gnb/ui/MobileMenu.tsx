'use client'

import Link from 'next/link'
import { CloseIcon } from '@/shared/assets'
import { LogoButton } from './LogoButton'
import { AuthActions } from './AuthActions'
import { MOBILE_MENU_ITEMS } from './NavItems'

interface MobileMenuProps {
  onClose: () => void
}

const MobileMenu = ({ onClose }: MobileMenuProps) => {
  return (
    <div className="fixed inset-0 z-modal flex flex-col bg-white">
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
      <AuthActions variant="block" onNavigate={onClose} className="px-[2.701rem] pt-[2.438rem]" />

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
