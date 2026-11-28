'use client'

import { useState } from 'react'
import { useRoutePathname } from '@/shared/lib/useRoutePathname'
import { MenuIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import { AppBadgeSync } from './AppBadgeSync'
import { AuthActions } from './AuthActions'
import { LogoButton } from './LogoButton'
import { NavBar } from './NavBar'
import { NotificationBell } from './NotificationBell'
import { MobileMenu } from './MobileMenu'
import { IconButton } from '@/shared/ui'

// 배경이 흰색이 아닌 화면에서는 헤더도 그 배경을 따라간다 (흰 띠가 떠 보이지 않게).
// BottomNav 의 경로 목록과 같은 방식 — 페이지가 <main> 안에 있어 props 나 CSS 변수로는 닿지 않는다.
// 분양글 작성(/adoption/create)과 수정(/adoption/:id/edit)은 같은 폼 화면이라 함께 칠한다.
const TINTED_HEADER_PATTERN = /^\/adoption\/(create|[^/]+\/edit)$/

const Gnb = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = useRoutePathname()
  // 웹은 모든 화면에 로고 바를 둔다. 앱은 홈과 탐색(로고·알림·메뉴·검색)에서만 쓰고,
  // 다른 화면은 각자 머리(RootHeader·공개 홈 상단 바·채팅방 헤더)가 맡는다
  const hideAppHeader = pathname !== '/' && pathname !== '/explore'

  return (
    <>
      {/* 높이는 Figma 740-66523 디바이스 프레임 기준 (mo h48 · tab py8 · pc h64) — globals.css --header-h.
          좌우 폭·여백은 본문과 같은 페이지 틀(page-shell)이라 로고와 본문 왼쪽 끝이 맞는다.
          data-app-hidden 이면 앱에서 --header-h 가 0 이 되어, 아래 sticky·꽉 찬 높이가 같이 따라온다 */}
      <header
        data-gnb
        data-app-hidden={hideAppHeader || undefined}
        className={cn(
          'fixed inset-x-0 top-0 z-header flex h-(--header-h) w-full items-center justify-center tab:py-2',
          TINTED_HEADER_PATTERN.test(pathname) ? 'bg-point-50' : 'bg-white',
          hideAppHeader && 'in-data-app:hidden',
        )}
      >
        <div className="page-shell flex items-center justify-between">
          <LogoButton />

          {/* Figma 3349:1763537 — pc 는 nav·로그인·메뉴 아이콘 사이 20px.
              mo·tab 은 헤더가 좁아 12px 로 줄인다.
              비로그인은 nav 대신 로그인/회원가입 (Figma GNB '로그인' 상태) */}
          <div className="flex items-center gap-3 lap:gap-5">
            {/* [refactored] 노출 조건은 AuthActions 가 판단한다. PC 는 NavBar 안 마이홈 자리에서 렌더 */}
            <AuthActions placement="header-mobile" className="lap:hidden" />
            <NavBar className="hidden lap:flex" />
            {/* 알림은 상시 확인하는 정보라 메뉴 안에 숨기지 않고 헤더에 상주시킨다.
                pc 는 NavBar 안 마이홈 옆에서 렌더하므로 여기는 pc 미만 전용 (AuthActions 와 같은 방식) */}
            <NotificationBell className="lap:hidden" />
            {/* 햄버거 메뉴 — 탭·모바일은 nav 대체, 데스크탑은 보조 메뉴 (전 브레이크포인트) */}
            <IconButton
              tone="brand"
              edge="both"
              onClick={() => setMenuOpen(true)}
              aria-label="메뉴 열기"
            >
              {/* Figma icon/menu — colors/icon/interactive/main color/Primary (#ad651d) */}
              <MenuIcon className="size-6" />
            </IconButton>
          </div>
        </div>
      </header>
      {/* 헤더는 fixed 라 흐름에서 빠지므로 같은 높이만큼 자리를 비워 둔다.
          sticky 였을 때 iOS 앱에서 뒤로 돌아오면 헤더가 1~2프레임 사라졌다(fixed 는 시뮬레이터 9회 모두 0프레임, #640). */}
      <div aria-hidden className="h-(--header-h) shrink-0" />

      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
      <AppBadgeSync />
    </>
  )
}

export { Gnb }
