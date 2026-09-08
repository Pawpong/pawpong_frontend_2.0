import { cn } from '@/shared/lib/cn'
import { PawPrintIcon } from '@/shared/assets' // [refactored] 빈 아바타 폴백 아이콘 유저글리프 → paw
import { Avatar, AvatarFallback, AvatarImage } from './Avatar'

interface ProfileAvatarProps {
  /** 프로필 이미지 URL (없으면 픽셀 글리프 placeholder) */
  src?: string
  alt?: string
  size?:
    | 'xsmall'
    | 'small'
    | 'medium'
    | 'large'
    | 'xlarge'
    | 'responsive'
    | 'responsivePc'
    | 'responsiveProfile'
  className?: string
}

export type ProfileAvatarSize = NonNullable<ProfileAvatarProps['size']>

// Figma Avatar 사이즈 시스템 (node 817:103336) — box / 내부 글리프
// glyph: PawPrintIcon(비율 1.2:1)로 교체하며 체감 축소를 보정하기 위해 한 단계씩 키움
const AVATAR_SIZE = {
  xsmall: { box: 'size-6', glyph: 'h-3.5 w-[0.8125rem]' }, // 24 / 14×13
  small: { box: 'size-8', glyph: 'size-5' }, // 32 / 20
  medium: { box: 'size-10', glyph: 'h-[1.625rem] w-[1.5625rem]' }, // 40 / 26×25
  large: { box: 'size-[3.25rem]', glyph: 'h-[2.125rem] w-[2.0625rem]' }, // 52 / 34×33
  xlarge: { box: 'size-[6.25rem]', glyph: 'h-[4rem] w-[3.875rem]' }, // 100 / 64×62
  // small(32) → medium(40): 태블릿+ 커짐 (피드 카드)
  responsive: { box: 'size-8 tab:size-10', glyph: 'size-5 tab:h-[1.625rem] tab:w-[1.5625rem]' },
  // small(32) → medium(40): PC에서만 커짐 (홈 우리아이자랑 쇼케이스)
  responsivePc: { box: 'size-8 pc:size-10', glyph: 'size-5 pc:h-[1.625rem] pc:w-[1.5625rem]' },
  // 56 → 64: PC에서만 커짐 (마이홈·공개홈 프로필 카드)
  responsiveProfile: { box: 'size-14 pc:size-16', glyph: 'size-9 pc:size-10' },
} as const

/**
 * 프로필 아바타 — 사진 있으면 이미지, 없으면 paw 글리프 placeholder.
 * 색: 배경 #ededed(bg/tertiary) · 글리프 #a6a6a6(icon/tertiary) — Figma 817-103336
 */
const ProfileAvatar = ({ src, alt, size = 'small', className }: ProfileAvatarProps) => {
  return (
    <Avatar className={cn(AVATAR_SIZE[size].box, className)}>
      {src && <AvatarImage src={src} alt={alt} />}
      {/* [refactored] PixelUserIcon → PawPrintIcon, 색 #ededed/#a6a6a6 (Figma) */}
      <AvatarFallback className="bg-neutral-100 text-neutral-500">
        <PawPrintIcon className={AVATAR_SIZE[size].glyph} />
      </AvatarFallback>
    </Avatar>
  )
}

export { ProfileAvatar }
