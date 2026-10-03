import type { SVGProps } from 'react'
import { PixelActionIcon } from './PixelActionIcon'

const PixelMessageIcon = ({
  status = 'default',
  ...props
}: SVGProps<SVGSVGElement> & { status?: 'default' | 'fill' }) => (
  <PixelActionIcon glyph="comment" filled={status === 'fill'} {...props} />
)
export { PixelMessageIcon }
