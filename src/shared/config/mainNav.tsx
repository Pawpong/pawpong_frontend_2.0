import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { ProfileAvatar } from '@/shared/ui'
import { NAV_ICON_DATA, NavIconSvg, type NavIconData } from '@/shared/assets'

// Figma nav icon 세트 (1019:38520) — status=Default / hover-press 두 변형.
// Default 는 단색이라 currentColor 로 그린다 (하단 내비 회색 / PC 헤더 브라운).
// hover-press 는 노란 채움 + 브라운 외곽의 투톤이다.
// [refactored] 그림은 NAV_ICON_DATA 한 곳에 두고 헤더·하단바·앱 탭 바(TAB_CONFIG)가 같이 쓴다.

interface NavIconProps {
  className?: string
  /** 마이홈 전용 — 로그인 사용자의 프로필 사진. 없으면 기본 paw 아바타(Figma profile=X) */
  src?: string
  /** 마이홈 전용 — 활성 시 아바타에 primary 링 (Figma 4161:849060) */
  active?: boolean
}

/** 기본·선택 그림 한 쌍. 마이홈은 그림 대신 프로필 사진(avatar)을 쓴다 */
export type NavGlyphs = { icon: NavIconData; active: NavIconData } | 'avatar'

/** 상태에 맞는 그림을 그린다. scale 이 있는 그림(커뮤니티 선택)은 칸 가운데에 그 비율로 작게 놓는다 */
const NavGlyphIcon = ({
  glyphs,
  className,
  active,
}: NavIconProps & { glyphs: Exclude<NavGlyphs, 'avatar'> }) => {
  const data = active ? glyphs.active : glyphs.icon
  if (!data.scale) return <NavIconSvg data={data} className={className} />
  const size = `${data.scale * 100}%`
  return (
    <span className={cn('flex items-center justify-center', className)} aria-hidden>
      <NavIconSvg data={data} style={{ width: size, height: size }} />
    </span>
  )
}

/**
 * 마이홈 — 프로필 사진이 있으면 사진, 없으면 기본 paw 아바타.
 * Figma 는 아이콘 박스 30 안에 2px 여백을 두고 아바타 25.97 을 놓는다 (4042:775065).
 * 활성 상태에서는 아바타에 2px primary 링을 두른다 (4161:849060 / 4161:849526).
 */
const NavMyHomeIcon = ({ className, src, active }: NavIconProps) => (
  <span className={cn('flex items-center justify-center p-0.5', className)}>
    <ProfileAvatar
      src={src}
      size="xsmall"
      className={cn('size-full', active && 'border-2 border-primary-500')}
    />
  </span>
)

const glyphIcon = (glyphs: NavGlyphs) => {
  const NavIcon = (props: NavIconProps) =>
    glyphs === 'avatar' ? <NavMyHomeIcon {...props} /> : <NavGlyphIcon glyphs={glyphs} {...props} />
  NavIcon.displayName = 'NavIcon'
  return NavIcon
}

const pair = (icon: NavIconData, active: NavIconData) => ({ icon, active })

export interface MainNavItem {
  href: string
  label: string
  bottomLabel?: string
  /** 그림 데이터 — 앱 탭 바에도 그대로 보낸다 */
  glyphs: NavGlyphs
  Icon: (props: NavIconProps) => ReactNode
  isActive: (pathname: string) => boolean
}

const NAV_ITEMS: Omit<MainNavItem, 'Icon'>[] = [
  {
    href: '/',
    label: '홈',
    glyphs: pair(NAV_ICON_DATA.home, NAV_ICON_DATA.homeActive),
    isActive: (p) => p === '/',
  },
  {
    href: '/explore',
    label: '탐색',
    glyphs: pair(NAV_ICON_DATA.search, NAV_ICON_DATA.searchActive),
    isActive: (p) => p.startsWith('/explore') || p.startsWith('/care-map'),
  },
  {
    href: '/chat',
    label: '채팅',
    glyphs: pair(NAV_ICON_DATA.chat, NAV_ICON_DATA.chatActive),
    isActive: (p) => p.startsWith('/chat'),
  },
  {
    href: '/community',
    label: '커뮤니티',
    glyphs: pair(NAV_ICON_DATA.community, NAV_ICON_DATA.communityActive),
    isActive: (p) => p.startsWith('/community'),
  },
  {
    href: '/playground',
    label: '놀이터',
    glyphs: pair(NAV_ICON_DATA.sparkle, NAV_ICON_DATA.sparkleActive),
    isActive: (p) => p.startsWith('/playground') || p.startsWith('/ai-filter'),
  },
  {
    href: '/home',
    label: '마이홈',
    // 하단 탭은 칸이 좁아 두 글자로 줄인다 (헤더는 마이홈)
    bottomLabel: '마이',
    glyphs: 'avatar',
    // /home/{userId} 는 남의 홈(내 ID 면 /home 으로 보낸다) — 마이 탭이 아니다
    isActive: (p) => p === '/home',
  },
]

export const MAIN_NAV: MainNavItem[] = NAV_ITEMS.map((item) => ({
  ...item,
  Icon: glyphIcon(item.glyphs),
}))

// 데스크탑 헤더 nav — 홈(로고가 대신)만 제외
export const HEADER_NAV = MAIN_NAV.filter((item) => item.href !== '/')

// 모바일 하단 탭 — 유리 캡슐에 5칸만 두려고 놀이터는 전체 메뉴로 보낸다
export const BOTTOM_NAV = MAIN_NAV.filter((item) => item.href !== '/playground')
