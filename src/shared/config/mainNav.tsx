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
  <svg viewBox="0 0 30 30" fill="currentColor" className={className} aria-hidden>
    <path d="M13.8857 25.813H5V24.188H13.8857V25.813ZM25 25.813H16.1055V24.188H25V25.813ZM7.22266 24.187H5V13.0767H7.22266V24.187ZM13.8887 24.187H11.667V19.7427H13.8887V24.187ZM18.333 24.187H16.1113V19.7427H18.333V24.187ZM25 24.187H22.7773V13.0767H25V24.187ZM16.1113 19.7427H13.8887V17.521H16.1113V19.7427ZM9.44434 13.0767H7.22266V10.854H9.44434V13.0767ZM22.7773 13.0767H20.5557V10.854H22.7773V13.0767ZM11.667 10.854H9.44434V8.63135H11.667V10.854ZM20.5557 10.854H18.333V8.63135H20.5557V10.854ZM13.8887 8.63135H11.667V6.40967H13.8887V8.63135ZM18.333 8.63135H16.1113V6.40967H18.333V8.63135ZM16.1113 6.40967H13.8887V4.18701H16.1113V6.40967Z" />
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
  <svg viewBox="0 0 30 30" fill="currentColor" className={className} aria-hidden>
    <path d="M7.02637 24.9785H5.03125V23.9834H6.02246V22.9766H7.02637V21.9814H5.01465V19.9746H5.01953V8.00684H5V6H25.0049V8.00684H25.0195V21.9814H11.0283V22.9766H9.03711V23.9834H7.02637V24.9785ZM7.02637 19.9746H23.0137V8.00684H7.02637V19.9746ZM12.0225 14.9902H10.0254V12.9922H12.0225V14.9902ZM16.0186 14.9902H14.0205V12.9922H16.0186V14.9902ZM20.0137 14.9902H18.0156V12.9922H20.0137V14.9902Z" />
  </svg>
)

/**
 * 비활성 글리프는 다른 nav 아이콘과 같이 인라인 SVG 로 그린다.
 *
 * 이전에는 CSS `mask` 로 외부 SVG 를 씌웠는데, 축약 속성 `mask` 는 Safari 가
 * `-webkit-mask` 없이는 적용하지 않아 마스크가 통째로 무시됐다. 그러면 아래 깔린
 * `bg-current` 만 남아 아이콘이 글자색 사각형 덩어리로 보인다. (경로는 bottom-community.svg 원본)
 */
const NavCommunityGlyph = ({ className }: NavIconProps) => (
  <svg viewBox="0 0 22 30" fill="currentColor" className={className} aria-hidden>
    <path d="M3.7998 18.5996H5.59961V20.3994H7.40039V22.2002H9.2002V24H2V16.7998H3.7998V18.5996ZM11 22.2002H9.2002V20.3994H11V22.2002ZM12.7998 20.3994H11V18.5996H12.7998V20.3994ZM9.2002 18.5996H7.40039V16.7998H9.2002V18.5996ZM14.5996 18.5996H12.7998V16.7998H14.5996V18.5996ZM5.59961 16.7998H3.7998V15H5.59961V16.7998ZM11 16.7998H9.2002V15H11V16.7998ZM16.3994 16.7998H14.5996V15H16.3994V16.7998ZM7.40039 15H5.59961V13.2002H7.40039V15ZM12.7998 15H11V13.2002H12.7998V15ZM18.2002 15H16.3994V13.2002H18.2002V15ZM9.2002 13.2002H7.40039V11.4004H9.2002V13.2002ZM16.3994 13.2002H14.5996V11.4004H16.3994V13.2002ZM20 13.2002H18.2002V11.4004H20V13.2002ZM11 11.4004H9.2002V9.59961H11V11.4004ZM14.5996 11.4004H12.7998V9.59961H14.5996V11.4004ZM18.2002 11.4004H16.3994V9.59961H18.2002V11.4004ZM12.7998 9.59961H11V7.7998H12.7998V9.59961ZM16.3994 9.59961H14.5996V7.7998H16.3994V9.59961ZM14.5996 7.7998H12.7998V6H14.5996V7.7998Z" />
  </svg>
)

const NavCommunityIcon = ({ className, active }: NavIconProps) => (
  <span className={cn('flex items-center justify-center', className)} aria-hidden>
    {active ? (
      <Image
        src="/images/nav/bottom-community-active.svg"
        alt=""
        width={18}
        height={18}
        className="size-3/5"
      />
    ) : (
      <NavCommunityGlyph className="size-full" />
    )}
  </span>
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
    Icon: NavCommunityIcon,
    isActive: (p) => p.startsWith('/community'),
  },
  { href: '/home', label: '마이홈', Icon: NavMyHomeIcon, isActive: (p) => p.startsWith('/home') },
]

// 데스크탑 헤더 nav — 홈(로고가 대신)만 제외
export const HEADER_NAV = MAIN_NAV.filter((item) => item.href !== '/')
