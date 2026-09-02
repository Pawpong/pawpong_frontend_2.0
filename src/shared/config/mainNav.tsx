import type { ReactNode } from 'react'
import Image from 'next/image'
import { cn } from '@/shared/lib/cn'
import { ProfileAvatar } from '@/shared/ui'

// Figma nav icon 세트 (1019:38520) — status=Default / hover-press 두 변형.
// Default 는 단색이라 currentColor 로 그린다 (하단 내비 회색 / PC 헤더 브라운).
// hover-press 는 노란 채움 + 브라운 외곽의 투톤이라 currentColor 로 표현할 수 없어
// Figma 에서 뽑은 SVG 를 그대로 쓴다 (public/images/nav/*).
// 헤더(데스크탑)와 BottomNav(모바일/탭)가 공유한다.

interface NavIconProps {
  className?: string
  /** 마이홈 전용 — 로그인 사용자의 프로필 사진. 없으면 기본 paw 아바타(Figma profile=X) */
  src?: string
  /** 마이홈 전용 — 활성 시 아바타에 primary 링 (Figma 4161:849060) */
  active?: boolean
}

const NavHomeIcon = ({ className }: NavIconProps) => (
  <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden>
    <g transform="translate(6.806 5.658)">
      <path d="M11.4932 12.6426H6.89551V20.6875H0V6.89551H1.14941V5.74609H2.29883V4.59668H4.59668V3.44824H5.74609V2.29883H6.89551V1.14941H8.04492V0H10.3438V1.14941H11.4932V2.29883H12.6426V3.44824H13.791V4.59668H16.0898V5.74609H17.2393V6.89551H18.3887V20.6875H11.4932V12.6426Z" />
    </g>
  </svg>
)

const NavSearchIcon = ({ className }: NavIconProps) => (
  <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden>
    <g transform="translate(6 6)">
      <path d="M11.8181 0H4.54536V2.72727H11.8181V0Z" />
      <path d="M4.54553 2.72739H1.81826V5.45466H4.54553V2.72739Z" />
      <path d="M14.5455 2.72739H11.8183V5.45466H14.5455V2.72739Z" />
      <path d="M2.72727 5.45478H0V10.9093H2.72727V5.45478Z" />
      <path d="M16.3636 5.45478H13.6364V10.9093H16.3636V5.45478Z" />
      <path d="M4.54553 10.9096H1.81826V13.6368H4.54553V10.9096Z" />
      <path d="M14.5454 10.9096H10.909V14.5459H14.5454V10.9096Z" />
      <path d="M11.8181 13.6364H4.54536V16.3636H11.8181V13.6364Z" />
      <path d="M17.2727 13.6364H13.6364V17.2727H17.2727V13.6364Z" />
      <path d="M20 16.3638H16.3636V20.0001H20V16.3638Z" />
    </g>
  </svg>
)

const NavChatIcon = ({ className }: NavIconProps) => (
  <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden>
    <g transform="translate(5.328 5.862)">
      <path d="M19.2109 2.13477H21.3457V14.9414H19.2109V17.0762H6.40332V18.1436H4.26855V19.2109H2.13477V20.2783H0V19.2109H1.06738V18.1436H2.13477V14.9414H0V2.13477H2.13477V0H19.2109V2.13477ZM5.33594 9.60547H7.4707V7.4707H5.33594V9.60547ZM9.60547 9.60547H11.7402V7.4707H9.60547V9.60547ZM13.874 9.60547H16.0088V7.4707H13.874V9.60547Z" />
    </g>
  </svg>
)

const NavCommunityIcon = ({ className }: NavIconProps) => (
  <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden>
    <g transform="translate(3.037 8.81)">
      <path d="M15.2803 7.74121H16.6035V8.51562H17.5967V9.29004H18.2588V9.7373H18.3145V8.96387H22.9473V9.7373H24.2715V10.5117H25.2646V11.2861H25.9268V14.3828H15.335V12.3867H10.5918V14.3828H0V11.2861H0.662109V10.5117H1.65527V9.7373H2.97852V8.96387H7.6123V9.7373H7.66699V9.29004H8.3291V8.51562H9.32227V7.74121H10.6465V6.96777H15.2803V7.74121ZM6.79199 2.76953H7.54004V3.54395H8.28809V5.86719H7.54004V6.64062H6.79199V7.80176H3.7998V6.64062H3.05176V5.86719H2.30371V3.54395H3.05176V2.76953H3.7998V1.99609H6.79199V2.76953ZM22.127 2.76953H22.875V3.54395H23.623V5.86719H22.875V6.64062H22.127V7.80176H19.1348V6.64062H18.3867V5.86719H17.6387V3.54395H18.3867V2.76953H19.1348V1.99609H22.127V2.76953ZM14.459 0.773438H15.207V1.54785H15.9551V3.87109H15.207V4.64453H14.459V5.80566H11.4668V4.64453H10.7188V3.87109H9.9707V1.54785H10.7188V0.773438H11.4668V0H14.459V0.773438Z" />
    </g>
  </svg>
)

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

/** Default(단색 글리프) ↔ hover-press(투톤 SVG) 를 상태에 따라 바꿔 그린다 */
const withActiveIcon = (Glyph: (props: NavIconProps) => ReactNode, activeSrc: string) => {
  const NavIcon = ({ className, active }: NavIconProps) =>
    active ? (
      <Image src={activeSrc} alt="" width={30} height={30} className={className} />
    ) : (
      <Glyph className={className} />
    )
  NavIcon.displayName = 'NavIcon'
  return NavIcon
}

export interface MainNavItem {
  href: string
  label: string
  bottomLabel?: string
  Icon: (props: NavIconProps) => ReactNode
  isActive: (pathname: string) => boolean
}

export const MAIN_NAV: MainNavItem[] = [
  {
    href: '/',
    label: '홈',
    Icon: withActiveIcon(NavHomeIcon, '/images/nav/nav-home-active.svg'),
    isActive: (p) => p === '/',
  },
  {
    href: '/explore',
    label: '탐색',
    Icon: withActiveIcon(NavSearchIcon, '/images/nav/nav-search-active.svg'),
    isActive: (p) => p.startsWith('/explore'),
  },
  {
    href: '/chat',
    label: '채팅',
    bottomLabel: '채팅방',
    Icon: withActiveIcon(NavChatIcon, '/images/nav/nav-chat-active.svg'),
    isActive: (p) => p.startsWith('/chat'),
  },
  {
    href: '/community',
    label: '커뮤니티',
    Icon: withActiveIcon(NavCommunityIcon, '/images/nav/nav-community-active.svg'),
    isActive: (p) => p.startsWith('/community'),
  },
  { href: '/home', label: '마이홈', Icon: NavMyHomeIcon, isActive: (p) => p.startsWith('/home') },
]

// 데스크탑 헤더 nav — 홈(로고가 대신)만 제외
export const HEADER_NAV = MAIN_NAV.filter((item) => item.href !== '/')
