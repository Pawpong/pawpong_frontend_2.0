import type { SVGProps } from 'react'
import { PixelActionIcon } from './PixelActionIcon'

type FavoriteIconSize = 'md' | 'lg'
type FavoriteIconStatus = 'default' | 'fill'
interface FavoriteIconProps extends Omit<SVGProps<SVGSVGElement>, 'size'> {
  size?: FavoriteIconSize
  status?: FavoriteIconStatus
}
const FavoriteIcon = ({ size = 'md', status = 'default', ...props }: FavoriteIconProps) => (
  <PixelActionIcon
    glyph="heart"
    filled={status === 'fill'}
    width={size === 'lg' ? 48 : 24}
    height={size === 'lg' ? 48 : 24}
    {...props}
  />
)
export { FavoriteIcon }
export type { FavoriteIconProps, FavoriteIconSize, FavoriteIconStatus }
