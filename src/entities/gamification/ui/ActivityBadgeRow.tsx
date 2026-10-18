import type { PublicActivityBadge } from '../model/types'
import { PixelActivityBadge } from './PixelActivityBadge'
export function ActivityBadgeRow({ badges }: { badges: PublicActivityBadge[] }) {
  if (!badges.length) return null
  return (
    <span className="mt-1 flex flex-wrap items-center gap-1.5" aria-label="작성자의 활동 배지">
      {badges.slice(0, 3).map((badge) => (
        <span
          key={badge.key}
          title={`${badge.title}: ${badge.description}`}
          className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-1 text-[10px] font-semibold text-emerald-900"
        >
          <PixelActivityBadge badgeKey={badge.key} title={badge.title} size={18} />
          {badge.title}
        </span>
      ))}
    </span>
  )
}
