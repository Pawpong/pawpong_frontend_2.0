'use client'

import type { ComponentType, MouseEvent, SVGProps } from 'react'
import Link from 'next/link'
import { tv } from '@/shared/lib/tv'

// 좋아요·관심·저장처럼 눌림 상태가 있는 아이콘 버튼 (구 FavoriteToggle·FavoriteButton·PostActionButton 통합).
// onClick → 버튼, href → 링크(댓글 아이콘 등), 둘 다 없으면 표시 전용.

type ToggleIconStatus = 'default' | 'fill'
type ToggleIcon = ComponentType<
  SVGProps<SVGSVGElement> & { status?: ToggleIconStatus; size?: 'md' | 'lg' }
>

const toggleIconVariants = tv({
  slots: {
    root: 'focus-ring inline-flex shrink-0 items-center gap-1 rounded-lg font-semibold text-action-dark [-webkit-tap-highlight-color:transparent] disabled:cursor-not-allowed',
    icon: 'shrink-0',
    label: 'text-body-sm',
    count: 'text-body-md',
  },
  variants: {
    size: {
      sm: { icon: 'size-6' },
      md: { icon: 'size-7.5' },
      lg: { icon: 'size-12' },
      // 카드 썸네일 위 하트 — 모바일 30 / pc 48
      responsive: { icon: 'size-7.5 pc:size-12' },
    },
    pressed: { true: '', false: '' },
    heart: {
      true: '',
      false: { root: 'transition-colors hover:bg-brand-subtle hover:text-brand-hover' },
    },
    pressedTone: {
      favorite: '',
      bookmark: '',
    },
    // 하트의 외곽은 화면 배경과 관계없이 브라운으로 표시한다.
    tone: {
      default: { icon: '' },
      onImage: { icon: '' },
    },
  },
  compoundVariants: [
    { pressed: false, tone: 'default', heart: false, className: { icon: 'text-brand' } },
    { pressed: false, tone: 'onImage', heart: false, className: { icon: 'text-base-white' } },
    { pressed: false, tone: 'default', heart: true, className: { icon: 'text-brand' } },
    { pressed: false, tone: 'onImage', heart: true, className: { icon: 'text-brand' } },
    {
      pressed: true,
      pressedTone: 'favorite',
      className: { icon: 'text-pressed-favorite', label: 'text-pressed-favorite' },
    },
    {
      pressed: true,
      pressedTone: 'bookmark',
      className: { icon: 'text-brand', label: 'text-brand' },
    },
  ],
  defaultVariants: { size: 'sm', pressed: false, pressedTone: 'favorite', tone: 'default' },
})

interface ToggleIconButtonProps {
  icon: ToggleIcon
  /** 눌림 시 채워진 경로가 있는 아이콘(FavoriteIcon)이면 true — status 를 넘긴다 */
  hasFillState?: boolean
  pressed?: boolean
  pressedTone?: 'favorite' | 'bookmark'
  tone?: 'default' | 'onImage'
  size?: 'sm' | 'md' | 'lg' | 'responsive'
  /** 보이는 라벨 (예: '관심있어요') */
  label?: string
  /** tablet: 태블릿 이상에서만 라벨을 표시한다. */
  labelVisibility?: 'always' | 'tablet'
  count?: number
  /** 라벨이 없을 때 필수 */
  'aria-label'?: string
  onClick?: () => void
  href?: string
  disabled?: boolean
  className?: never
  style?: never
}

const ToggleIconButton = ({
  icon: Icon,
  hasFillState = false,
  pressed = false,
  pressedTone,
  tone,
  size,
  label,
  labelVisibility = 'always',
  count,
  'aria-label': ariaLabel,
  onClick,
  href,
  disabled,
}: ToggleIconButtonProps) => {
  const isHeart = hasFillState && pressedTone !== 'bookmark'
  const styles = toggleIconVariants({
    size,
    pressed,
    pressedTone,
    tone,
    heart: isHeart,
  })
  const iconState = hasFillState
    ? { status: pressed ? ('fill' as const) : ('default' as const) }
    : {}

  const content = (
    <>
      {isHeart && size === 'responsive' ? (
        <>
          {/* 화면 폭을 JS로 읽지 않아 첫 렌더와 크기 변경 때도 모양이 깜빡이지 않는다. */}
          <Icon
            aria-hidden="true"
            {...iconState}
            size="md"
            className={styles.icon({ className: 'pc:hidden' })}
          />
          <Icon
            aria-hidden="true"
            {...iconState}
            size="lg"
            className={styles.icon({ className: 'hidden pc:block' })}
          />
        </>
      ) : (
        <Icon
          aria-hidden="true"
          {...iconState}
          {...(isHeart && { size: size === 'lg' ? ('lg' as const) : ('md' as const) })}
          className={styles.icon()}
        />
      )}
      {label && (
        <span
          className={styles.label({
            className: labelVisibility === 'tablet' ? 'hidden tab:inline' : undefined,
          })}
        >
          {label}
        </span>
      )}
      {count !== undefined && <span className={styles.count()}>{count}</span>}
    </>
  )

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className={styles.root()}>
        {content}
      </Link>
    )
  }

  if (!onClick) {
    return (
      <span className={styles.root()}>
        {ariaLabel && <span className="sr-only">{ariaLabel}</span>}
        {content}
      </span>
    )
  }

  // 카드 Link 안에 놓이는 경우가 많아 네비게이션을 막고 토글만 한다
  const handleClick = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onClick()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={pressed}
      className={styles.root()}
    >
      {content}
    </button>
  )
}

export { ToggleIconButton, type ToggleIconButtonProps }
