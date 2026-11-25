import type { SVGProps } from 'react'

type FavoriteIconSize = 'md' | 'lg'
type FavoriteIconStatus = 'default' | 'fill'

interface FavoriteIconProps extends Omit<SVGProps<SVGSVGElement>, 'size'> {
  /** 공통 액션 아이콘 박스: md 30px, lg 48px */
  size?: FavoriteIconSize
  /** default는 외곽선 하트, fill은 채워진 하트 */
  status?: FavoriteIconStatus
}

/** 댓글·저장과 같은 30 캔버스, 2px 선 두께를 쓰는 하트. */
const FavoriteIcon = ({ size = 'md', status = 'default', ...props }: FavoriteIconProps) => {
  const dimension = size === 'lg' ? 48 : 30

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 30 30"
      fill={status === 'fill' ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M15 24s-10.5-6.4-10.5-13a5.5 5.5 0 0 1 10.5-2.3A5.5 5.5 0 0 1 25.5 11C25.5 17.6 15 24 15 24Z" />
    </svg>
  )
}

export { FavoriteIcon }
export type { FavoriteIconProps, FavoriteIconSize, FavoriteIconStatus }
