import Link from 'next/link'
import { cn } from '@/shared/lib/cn'
import { FAVORITE_ACTIVE, FAVORITE_INACTIVE } from './FavoriteToggle'

// Figma icon/bookmark press — 저장 시 브랜드 브라운
export const BOOKMARK_ACTIVE = 'text-[#a9835a]'

interface PostActionIconProps extends React.SVGProps<SVGSVGElement> {
  status?: 'default' | 'fill'
}

interface PostActionButtonProps {
  icon: React.ComponentType<PostActionIconProps>
  count?: number
  /** 활성(예: 좋아요 누름) 상태 — 아이콘 강조 색 */
  active?: boolean
  /** 활성 시 색 (기본 하트 #ff8181, 북마크는 BOOKMARK_ACTIVE 등) */
  activeClassName?: string
  /** 아이콘 크기 오버라이드 (기본 24px, Figma community-icon은 32px) */
  iconClassName?: string
  /** 상태별 SVG 경로가 있는 아이콘의 variant */
  iconStatus?: 'default' | 'fill'
  /** 아이콘 전용(카운트 없는) 버튼의 접근성 라벨 */
  ariaLabel?: string
  /** 있으면 버튼으로 렌더(클릭 가능), 없으면 표시전용 */
  onClick?: () => void
  /** 있으면 링크로 렌더 (댓글 아이콘 → 게시글 상세) */
  href?: string
  disabled?: boolean
}

const PostActionButton = ({
  icon: Icon,
  count,
  active,
  activeClassName,
  iconClassName,
  iconStatus,
  ariaLabel,
  onClick,
  href,
  disabled,
}: PostActionButtonProps) => {
  const inner = (
    <>
      {/* Figma 아이콘 press 상태: 기본 #a6a6a6, 하트 #ff8181 / 북마크 #a9835a */}
      <Icon
        {...(iconStatus && { status: iconStatus })}
        className={cn(
          iconClassName ?? 'size-6',
          active ? (activeClassName ?? FAVORITE_ACTIVE) : FAVORITE_INACTIVE,
        )}
      />
      {count !== undefined && (
        // Figma community-icon 카운트: 14px semibold #3e3e3e, line-height 1.5
        <span className="text-sm leading-[1.5] font-semibold text-neutral-850">{count}</span>
      )}
    </>
  )

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className="flex items-center gap-1">
        {inner}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-pressed={active}
        className="flex items-center gap-1 disabled:opacity-50"
      >
        {inner}
      </button>
    )
  }

  return <div className="flex items-center gap-1">{inner}</div>
}

export { PostActionButton }
