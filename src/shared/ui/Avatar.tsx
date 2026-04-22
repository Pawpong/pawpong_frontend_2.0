'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@/shared/lib/Cn'

const avatarVariants = tv({
  base: 'relative flex shrink-0 overflow-hidden rounded-full',
  variants: {
    size: {
      sm: 'size-[2.3125rem]',
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
  <AvatarPrimitive.Image ref={ref} className={cn('aspect-square size-full', className)} {...props} />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

export const AvatarFallback = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex size-full items-center justify-center rounded-full bg-zinc-100 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
      className,
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName
