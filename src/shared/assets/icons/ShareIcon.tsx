import type { SVGProps } from 'react'
import { PixelActionIcon } from './PixelActionIcon'

const ShareIcon = ({
  status = 'default',
  ...props
}: SVGProps<SVGSVGElement> & { status?: 'default' | 'fill' }) => (
  <PixelActionIcon glyph="share" filled={status === 'fill'} {...props} />
)
export { ShareIcon }
