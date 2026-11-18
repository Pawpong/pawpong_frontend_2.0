import type { SVGProps } from 'react'

const ShareIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="square"
    aria-hidden="true"
    {...props}
  >
    <path d="M5.25 17.25V23.25H6.75V24.75H23.25V23.25H24.75V17.25" />
    <path d="M15 18.75V4.5M9 10.5L15 4.5L21 10.5" />
  </svg>
)
export { ShareIcon }
