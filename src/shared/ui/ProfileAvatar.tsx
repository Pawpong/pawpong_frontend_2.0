import { cn } from '@/shared/lib/cn'
import { PawIcon } from '@/shared/assets/icons' // [refactored] 빈 아바타 폴백 아이콘 유저글리프 → paw
import { Avatar, AvatarFallback, AvatarImage } from './Avatar'

interface ProfileAvatarProps {
  /** 프로필 이미지 URL (없으면 픽셀 글리프 placeholder) */
  src?: string
  alt?: string
  size?: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'responsive' | 'responsivePc'
  className?: string
}

export type ProfileAvatarSize = NonNullable<ProfileAvatarProps['size']>

// Figma Avatar 사이즈 시스템 (node 817:103336) — box / 내부 글리프
const AVATAR_SIZE = {
  xsmall: { box: 'size-6', glyph: 'h-3 w-[0.6875rem]' }, // 24 / 12×11
  small: { box: 'size-8', glyph: 'size-4' }, // 32 / 16
  medium: { box: 'size-10', glyph: 'h-[1.375rem] w-[1.3125rem]' }, // 40 / 22×21
  large: { box: 'size-[3.25rem]', glyph: 'h-[1.875rem] w-[1.8125rem]' }, // 52 / 30×29
  xlarge: { box: 'size-[6.25rem]', glyph: 'h-[3.625rem] w-[3.5rem]' }, // 100 / 58×56
  // small(32) → medium(40): 태블릿+ 커짐 (피드 카드)
  responsive: { box: 'size-8 tab:size-10', glyph: 'size-4 tab:h-[1.375rem] tab:w-[1.3125rem]' },
  // small(32) → medium(40): PC에서만 커짐 (홈 우리아이자랑 쇼케이스)
  responsivePc: { box: 'size-8 pc:size-10', glyph: 'size-4 pc:h-[1.375rem] pc:w-[1.3125rem]' },
} as const

/**
 * 프로필 아바타 — 사진 있으면 이미지, 없으면 paw 글리프 placeholder.
 * 색: 배경 #ededed(bg/tertiary) · 글리프 #a6a6a6(icon/tertiary) — Figma 817-103336
 */
const ProfileAvatar = ({ src, alt, size = 'small', className }: ProfileAvatarProps) => {
  return (
    <Avatar className={cn(AVATAR_SIZE[size].box, className)}>
      {src && <AvatarImage src={src} alt={alt} />}
      {/* [refactored] PixelUserIcon → PawIcon, 색 #ededed/#a6a6a6 (Figma) */}
      <AvatarFallback className="bg-neutral-100 text-neutral-500">
        <PawIcon className={AVATAR_SIZE[size].glyph} />
      </AvatarFallback>
    </Avatar>
  )
}

export { ProfileAvatar }
