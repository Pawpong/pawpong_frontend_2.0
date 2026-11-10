import { Button, type ButtonVariantProps } from './Button'

// 팔로우 토글 버튼 — 상태를 공통 Button intent 로만 표현한다
type FollowStatus = 'follow' | 'following' | 'mutual'

const STATUS: Record<FollowStatus, { intent: ButtonVariantProps['intent']; label: string }> = {
  follow: { intent: 'primary', label: '팔로우' },
  following: { intent: 'secondary', label: '팔로잉' },
  mutual: { intent: 'dark', label: '맞팔로잉' },
}

interface FollowButtonProps {
  status: FollowStatus
  onClick?: () => void
  /** mutation 진행 중 중복 클릭 방지 */
  disabled?: boolean
  width?: ButtonVariantProps['width']
}

const FollowButton = ({ status, onClick, disabled, width }: FollowButtonProps) => (
  <Button
    intent={STATUS[status].intent}
    size="sm"
    onClick={onClick}
    disabled={disabled}
    width={width}
  >
    {STATUS[status].label}
  </Button>
)

export { FollowButton, type FollowStatus }
