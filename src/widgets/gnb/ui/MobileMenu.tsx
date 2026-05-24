'use client'

import Link from 'next/link'
import { CloseIcon } from '@/shared/assets/icons'
import { LogoButton } from './LogoButton'

const MENU_ITEMS = [
  { label: '알림', href: '/notifications' },
  { label: '저장목록', href: '/bookmarks' },
  { label: '설정', href: '/settings' },
]

interface MobileMenuProps {
  onClose: () => void
}

const MobileMenu = ({ onClose }: MobileMenuProps) => {
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

      {/* 메뉴 항목 */}
      <nav className="flex flex-col px-[2.701rem] pt-[2.438rem]">
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="py-3 text-xl font-semibold text-black"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export { MobileMenu }
