'use client'

import * as React from 'react'
import { cn } from '@/shared/lib/cn'

export const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="페이지네이션"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
)

export const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn('flex flex-row items-center gap-1', className)} {...props} />
))
PaginationContent.displayName = 'PaginationContent'

export const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn('', className)} {...props} />,
)
PaginationItem.displayName = 'PaginationItem'

export type PaginationLinkProps = React.ComponentProps<'a'> & {
  isActive?: boolean
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export const PaginationLink = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  ({ className, isActive, size = 'icon', ...props }, ref) => (
    <a
      ref={ref}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:outline-none focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950',
        size === 'default' && 'h-9 min-w-9 px-4 py-2',
        size === 'sm' && 'h-8 min-w-8 gap-1 px-3 text-xs',
        size === 'lg' && 'h-10 min-w-10 px-6',
        size === 'icon' && 'size-9',
        isActive
          ? 'border border-zinc-200 bg-zinc-100 text-zinc-950 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50'
          : 'hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-50',
        className,
      )}
      {...props}
    />
  ),
)
PaginationLink.displayName = 'PaginationLink'

export const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="이전 페이지"
    size="default"
    className={cn('gap-1 pl-2.5 sm:pr-4', className)}
    {...props}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-4"
      aria-hidden
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
    <span className="hidden sm:inline">이전</span>
  </PaginationLink>
)

export const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="다음 페이지"
    size="default"
    className={cn('gap-1 pr-2.5 sm:pl-4', className)}
    {...props}
  >
    <span className="hidden sm:inline">다음</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-4"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  </PaginationLink>
)

export const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('flex size-9 items-center justify-center', className)}
    {...props}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-4"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
    <span className="sr-only">더 많은 페이지</span>
  </span>
)
