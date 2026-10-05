import type { SVGProps } from 'react'
import { PixelActionIcon } from './PixelActionIcon'

type FavoriteIconSize = 'md' | 'lg'
type FavoriteIconStatus = 'default' | 'fill'

interface FavoriteIconProps extends Omit<SVGProps<SVGSVGElement>, 'size'> {
  /** 공통 액션 아이콘 박스: md 30px, lg 48px */
  size?: FavoriteIconSize
  /** default는 외곽선형 픽셀 하트, fill은 채워진 픽셀 하트 */
  status?: FavoriteIconStatus
}

/** 댓글·저장과 동일한 격자, 획 두께, 상하 여백을 사용하는 픽셀 하트. */
const FavoriteIcon = ({ size = 'md', status = 'default', ...props }: FavoriteIconProps) => {
  const dimension = size === 'lg' ? 48 : 30

  return (
    <PixelActionIcon
      glyph="heart"
      filled={status === 'fill'}
      width={dimension}
      height={dimension}
      {...props}
    />
  )
}

export { FavoriteIcon }
export type { FavoriteIconProps, FavoriteIconSize, FavoriteIconStatus }
