import type { SVGProps } from 'react'

const BookmarkIcon = ({
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
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M10 5.5h10a2.5 2.5 0 0 1 2.5 2.5v16.5L15 20l-7.5 4.5V8A2.5 2.5 0 0 1 10 5.5Z" />
  </svg>
)

export { BookmarkIcon }
