import { FavoriteButton } from '@/shared/ui'
import { ShareIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'

interface FavoriteShareActionsProps {
  isFavorite?: boolean
  onToggle?: () => void
  className?: string
}

// [refactored] 피그마 Frame1707484443 (관심있어요 + 공유) — 히어로/리스트 카드 공통 액션 행
// 아이콘 32, 아이콘↔텍스트 gap-0, 텍스트 12px semibold #3e3e3e, 행 gap-16
const FavoriteShareActions = ({ isFavorite, onToggle, className }: FavoriteShareActionsProps) => (
  <div className={cn('flex items-center gap-[1rem]', className)}>
    <FavoriteButton
      size="lg"
      className="gap-0 p-0 text-[0.75rem] font-semibold text-[#3e3e3e]"
      iconClassName="size-[2rem]"
      isFavorite={isFavorite}
      onToggle={onToggle}
    />
    <button
      type="button"
      className="flex items-center gap-0 text-[0.75rem] font-semibold text-[#3e3e3e]"
    >
      <ShareIcon className="size-[2rem]" />
      <span>공유</span>
    </button>
  </div>
)

export { FavoriteShareActions }
