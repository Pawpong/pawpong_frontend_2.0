import type { SVGProps } from 'react'

const PixelBookmarkIcon = ({
  status = 'default',
  ...props
}: SVGProps<SVGSVGElement> & { status?: 'default' | 'fill' }) => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill={status === 'fill' ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="square"
    aria-hidden="true"
    {...props}
  >
    <path d="M7.5 5.25H22.5V24.75L15 19.5L7.5 24.75Z" />
  </svg>
)
export { PixelBookmarkIcon }
