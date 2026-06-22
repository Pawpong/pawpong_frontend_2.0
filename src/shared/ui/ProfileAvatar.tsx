import { cn } from '@/shared/lib/cn'
import { PixelUserIcon } from '@/shared/assets/icons'
import { Avatar, AvatarFallback, AvatarImage } from './Avatar'

interface ProfileAvatarProps {
  /** 프로필 이미지 URL (없으면 픽셀 글리프 placeholder) */
  src?: string
  alt?: string
  size?: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'responsive'
  className?: string
}

// Figma Avatar 사이즈 시스템 (node 817:103336) — box / 내부 글리프
const AVATAR_SIZE = {
  xsmall: { box: 'size-6', glyph: 'h-3 w-[0.6875rem]' }, // 24 / 12×11
  small: { box: 'size-8', glyph: 'size-4' }, // 32 / 16
  medium: { box: 'size-10', glyph: 'h-[1.375rem] w-[1.3125rem]' }, // 40 / 22×21
  large: { box: 'size-[3.25rem]', glyph: 'h-[1.875rem] w-[1.8125rem]' }, // 52 / 30×29
  xlarge: { box: 'size-[6.25rem]', glyph: 'h-[3.625rem] w-[3.5rem]' }, // 100 / 58×56
  // 모바일 32 → 태블릿+ 40
  responsive: { box: 'size-8 tab:size-10', glyph: 'size-4 tab:h-[1.375rem] tab:w-[1.3125rem]' },
} as const

/**
 * 프로필 아바타 — 사진 있으면 이미지, 없으면 픽셀 유저 글리프 placeholder.
 * 색: 배경 #a6a6a6(icon/interactive/tertiary) · 글리프 #f6f6f6(text/interactive/invert)
 */
const ProfileAvatar = ({ src, alt, size = 'small', className }: ProfileAvatarProps) => {
  return (
    <Avatar className={cn(AVATAR_SIZE[size].box, className)}>
      {src && <AvatarImage src={src} alt={alt} />}
      <AvatarFallback className="bg-[#a6a6a6] text-[#f6f6f6]">
        <PixelUserIcon className={AVATAR_SIZE[size].glyph} />
      </AvatarFallback>
    </Avatar>
  )
}

export { ProfileAvatar }
