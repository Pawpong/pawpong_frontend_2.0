import { Button } from './Button'
import { cn } from '@/shared/lib/cn'

// 팔로우 토글 버튼 — 공통 Button(BaseButton) 기반 알약형
// following은 outline 그대로, follow/mutual만 fill을 덮어씀
type FollowStatus = 'follow' | 'following' | 'mutual'

const STATUS: Record<FollowStatus, { className: string; label: string }> = {
  follow: { className: 'border-transparent bg-fill-muted font-medium text-white', label: '팔로우' },
  following: { className: '', label: '팔로잉' },
  mutual: { className: 'border-transparent bg-[#3e3e3e] text-[#f6f6f6]', label: '맞팔로잉' },
}

// sm: 팔로워 모달 pill(h-32) / lg: 프로필 카드(h-40)
const SIZE = { sm: 'h-8 px-2 text-sm', lg: 'h-10 p-2.5 text-sm' } as const

interface FollowButtonProps {
  status: FollowStatus
  size?: keyof typeof SIZE
  onClick?: () => void
  /** mutation 진행 중 중복 클릭 방지 (Button의 disabled 스타일 그대로 사용) */
  disabled?: boolean
  className?: string
}

const FollowButton = ({
  status,
  size = 'lg',
  onClick,
  disabled,
  className,
}: FollowButtonProps) => (
  <Button
    variant="outline"
    onClick={onClick}
    disabled={disabled}
    className={cn(SIZE[size], STATUS[status].className, className)}
  >
    {STATUS[status].label}
  </Button>
)

export { FollowButton, type FollowStatus }
