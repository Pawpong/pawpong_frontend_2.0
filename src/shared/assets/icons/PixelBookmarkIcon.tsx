import type { SVGProps } from 'react'
import { PixelActionIcon } from './PixelActionIcon'

const PixelBookmarkIcon = ({
  status = 'default',
  ...props
}: SVGProps<SVGSVGElement> & { status?: 'default' | 'fill' }) => (
  <PixelActionIcon glyph="bookmark" filled={status === 'fill'} {...props} />
)
export { PixelBookmarkIcon }
