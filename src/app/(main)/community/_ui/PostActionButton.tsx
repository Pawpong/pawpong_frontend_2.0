import { cn } from '@/shared/lib/cn'

interface PostActionButtonProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  count?: number
  /** 활성(예: 좋아요 누름) 상태 — 아이콘 강조 색 */
  active?: boolean
  /** 있으면 버튼으로 렌더(클릭 가능), 없으면 표시전용 */
  onClick?: () => void
  disabled?: boolean
}

const PostActionButton = ({
  icon: Icon,
  count,
  active,
  onClick,
  disabled,
}: PostActionButtonProps) => {
  const inner = (
    <>
      <Icon className={cn('size-6', active ? 'text-red-500' : 'text-text-primary')} />
      {count !== undefined && (
        <span className="text-sm leading-[1.375rem] font-semibold text-text-primary">{count}</span>
      )}
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="flex items-center gap-1.5 disabled:opacity-50"
      >
        {inner}
      </button>
    )
  }

  return <div className="flex items-center gap-1.5">{inner}</div>
}

export { PostActionButton }
