'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { tv, type VariantProps } from '@/shared/lib/tv'
import { cn } from '@/shared/lib/cn'
import { optimizedImageUrl } from '@/shared/lib/optimizedImageUrl'
import { PawPrintIcon } from '@/shared/assets'

const avatarVariants = tv({
  base: 'relative flex shrink-0 overflow-hidden rounded-full',
  variants: {
    size: {
      xs: 'size-[1.645rem]',
      sm: 'size-[2.3125rem]',
      md: 'size-10',
      lg: 'h-[7.3125rem] w-[7.4375rem]',
      xl: 'h-[8.9375rem] w-[9.1875rem]',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

type AvatarProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants>

export const Avatar = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, ...props }, ref) => (
  <AvatarPrimitive.Root ref={ref} className={cn(avatarVariants({ size }), className)} {...props} />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

/** 호출부가 박스 크기를 알려주지 않았을 때 — 피드·댓글에서 가장 많이 쓰는 md(40px) */
const DEFAULT_AVATAR_BOX_WIDTH = 40

type AvatarImageProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> & {
  /**
   * 화면에 그려지는 아바타 박스의 가장 큰 폭(CSS px). 이 크기에 맞춰 리사이즈된 사진을 받는다.
   * Radix 아바타는 평범한 `<img>` 를 그려 next/image 의 자동 리사이즈가 걸리지 않으므로,
   * 알려주지 않으면 휴대폰으로 찍은 4000px 원본이 40px 자리에 그대로 들어온다.
   */
  boxWidth?: number
}

export const AvatarImage = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(({ className, src, boxWidth = DEFAULT_AVATAR_BOX_WIDTH, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    src={typeof src === 'string' ? optimizedImageUrl(src, boxWidth) : src}
    // object-cover: 정사각 박스에 비율 유지하며 채우고 넘치는 부분만 크롭 (없으면 이미지가 늘어나 찌그러짐)
    className={cn('aspect-square size-full object-cover', className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

// 빈 프로필 색은 여기 한 곳에서만 정한다 — 호출부가 className·style 로 바꿀 수 없다
export const AvatarFallback = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  Omit<React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>, 'className' | 'style'>
>(({ children, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    {...props}
    className="flex size-full items-center justify-center rounded-full bg-primary-50 text-sm font-medium text-primary-500"
  >
    {/* 이니셜 등을 넘기지 않으면 기본 아바타(발바닥) */}
    {children ?? <PawPrintIcon className="size-[58%] text-primary-500" />}
  </AvatarPrimitive.Fallback>
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName
