'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@/shared/lib/cn'
import { PawIcon } from '@/shared/assets'

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

export const AvatarImage = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    // object-cover: 정사각 박스에 비율 유지하며 채우고 넘치는 부분만 크롭 (없으면 이미지가 늘어나 찌그러짐)
    className={cn('aspect-square size-full object-cover', className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

export const AvatarFallback = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, children, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex size-full items-center justify-center rounded-full bg-neutral-100 text-sm font-medium text-neutral-500',
      className,
    )}
    {...props}
  >
    {/* 이니셜 등을 넘기지 않으면 기본 아바타(발바닥) */}
    {children ?? <PawIcon className="size-1/2 text-neutral-500" />}
  </AvatarPrimitive.Fallback>
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName
